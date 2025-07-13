require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Email setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Send order confirmation emails
async function sendOrderEmails(cart, customerEmail, customerName, shippingAddress, customerPhone, customerState, totalAmount) {
  const itemList = cart.map(item =>
    `<li>
      ${item.quantity} × ${item.name} (${item.color || 'No Color'}) - $${item.price.toFixed(2)}
      <br><img src="${item.image}" alt="${item.name}" style="width:100px;margin-top:5px;" />
    </li>`
  ).join('');

  const html = `
    <h2>Order Confirmation - Sandy's Max</h2>
    <p><strong>Customer Name:</strong> ${customerName}</p>
    <p><strong>Email:</strong> ${customerEmail}</p>
    <p><strong>Phone:</strong> ${customerPhone}</p>
    <p><strong>Shipping Address:</strong> ${shippingAddress}, ${customerState}</p>
    <h3>Items Ordered:</h3>
    <ul>${itemList}</ul>
    <p><strong>Total:</strong> $${totalAmount.toFixed(2)}</p>
    <p>We’ll notify you when it ships. Thank you for shopping with us!</p>
  `;

  // Send to customer
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: customerEmail,
    subject: "Your Sandy's Max Order Receipt",
    html,
  });

  // Send to admin/store owner
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: 'sandykoromago2store@gmail.com',
    subject: `New Order from ${customerName}`,
    html,
  });
}

// ✅ Payment & Email API
app.post('/create-payment-intent', async (req, res) => {
  try {
    const {
      amount,
      cart,
      customerEmail,
      customerName,
      shippingAddress,
      customerPhone,
      customerState
    } = req.body;

    if (!amount || !cart || !customerEmail || !customerName || !shippingAddress || !customerState) {
      return res.status(400).send({ error: "Missing required fields." });
    }

    const cartSummary = cart.map(item =>
      `${item.name} (${item.color || 'No Color'}) x${item.quantity}`
    ).join(', ');

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      description: `Order from Sandy's Max by ${customerName}`,
      shipping: {
        name: customerName,
        address: {
          line1: shippingAddress,
          state: customerState,
        }
      },
      receipt_email: customerEmail,
      metadata: {
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        customerState,
        products: cartSummary
      },
      automatic_payment_methods: { enabled: true }
    });

    const totalAmount = amount / 100;

    await sendOrderEmails(
      cart,
      customerEmail,
      customerName,
      shippingAddress,
      customerPhone,
      customerState,
      totalAmount
    );

    res.send({ clientSecret: paymentIntent.client_secret });

  } catch (error) {
    console.error("Payment error:", error);
    res.status(500).send({ error: error.message });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
