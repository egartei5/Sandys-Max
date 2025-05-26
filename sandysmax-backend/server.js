require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmails = async (orderDetails, customerEmail) => {
  // Email to customer
  await transporter.sendMail({
    from: `Sandy's Max <${process.env.EMAIL_USER}>`,
    to: customerEmail,
    subject: 'Order Confirmation - Sandy’s Max',
    text: `Thank you for your order!\n\nOrder Details:\n${orderDetails}`
  });

  // Email to producers
  await transporter.sendMail({
    from: `Sandy's Max <${process.env.EMAIL_USER}>`,
    to: 'producers@email.com', // replace with real producer email
    subject: 'New Order Received - Sandy’s Max',
    text: `A new order was placed:\n\n${orderDetails}`
  });
};

app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, customerEmail, cart } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      payment_method_types: ['card'],
    });

    const orderDetails = cart.map(item => `${item.name} - $${item.price} x ${item.quantity}`).join('\n');

    await sendEmails(orderDetails, customerEmail);

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).send({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
