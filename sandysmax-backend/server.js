require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

// Email setup with Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send order confirmation and producer notification
function sendOrderEmails(cart, customerEmail, customerName, shippingAddress, totalAmount) {
  const itemList = cart.map(item =>
    `<li>${item.quantity} × ${item.name} (Color: ${item.color}) - $${item.price.toFixed(2)}</li>`
  ).join('');

  const orderHtml = `
    <h2>Order Confirmation - Sandy's Max</h2>
    <p>Hi ${customerName},</p>
    <p>Thanks for your order! Here's what we received:</p>

    <h3>Shipping Info:</h3>
    <p>${shippingAddress}</p>

    <h3>Items:</h3>
    <ul>${itemList}</ul>

    <p><strong>Total Charged:</strong> $${totalAmount.toFixed(2)}</p>
    <p>Your order is now being processed. We'll notify you once it's shipped.</p>
    <p>Thank you for shopping with Sandy's Max!</p>
  `;

  // Email to Customer
  transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: customerEmail,
    subject: "Your Sandy's Max Order Receipt",
    html: orderHtml,
  });

  // Email to Producer
  transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: 'sandykoromago2store@gmail.com',
    subject: `New Order from ${customerName}`,
    html: orderHtml,
  });
}

// Handle payment and order metadata
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, cart, customerEmail, customerName, shippingAddress } = req.body;

    // Build summary for Stripe metadata
    const cartSummary = cart.map(item =>
      `${item.name} (Color: ${item.color}) x${item.quantity}`
    ).join(', ');

    // Create PaymentIntent with metadata
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      description: `Order from Sandy's Max: ${cartSummary}`,
      shipping: {
        name: customerName,
        address: {
          line1: shippingAddress
        }
      },
      receipt_email: customerEmail,
      metadata: {
        customerName,
        customerEmail,
        shippingLabel: shippingAddress,
        products: cartSummary
      },
      automatic_payment_methods: { enabled: true }
    });

    // Email order summary
    const totalAmount = amount / 100;
    sendOrderEmails(cart, customerEmail, customerName, shippingAddress, totalAmount);

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Payment error:", error);
    res.status(500).send({ error: error.message });
  }
});

// Run server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
