require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

// Email configuration using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send styled HTML email
function sendOrderEmails(orderDetails, customerEmail, customerName, shippingAddress) {
  const orderHtml = `
    <h2>Thank you for your order, ${customerName}!</h2>
    <p>Your order has been received and is being processed. Below are your order details:</p>
    <p><strong>Shipping Address:</strong> ${shippingAddress}</p>
    <h3>Order Items:</h3>
    <ul>
      ${orderDetails.map(item => `<li>${item.quantity} x ${item.name} - $${item.price}</li>`).join('')}
    </ul>
    <p><strong>Total:</strong> $${orderDetails.reduce((acc, item) => acc + item.quantity * item.price, 0).toFixed(2)}</p>
    <p>We appreciate your business!</p>
  `;

  // Email to customer
  transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: customerEmail,
    subject: 'Your Sandy\'s Max Order Confirmation',
    html: orderHtml,
  });

  // Email to producer
  transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: 'sandykoromago2store@gmail.com',
    subject: `New Order from ${customerName}`,
    html: orderHtml,
  });
}

app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, cart, customerEmail, customerName, shippingAddress } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      payment_method_types: ['card'],
    });

    // Send confirmation emails
    sendOrderEmails(cart, customerEmail, customerName, shippingAddress);

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).send({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
