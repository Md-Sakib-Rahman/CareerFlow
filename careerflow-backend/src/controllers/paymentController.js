const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User'); // Ensure this path is correct
const Transaction = require('../models/Transaction'); // 1. UNCOMMENTED THIS

// 1. Generate the Checkout URL
const createCheckoutSession = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Expect the frontend to send the chosen plan in the body
    // Default to 'pro' if nothing is sent, to prevent crashes
    const planType = req.body.planType || 'pro'; 

    // Dynamically set price and name based on the plan
    let priceInCents = 999; // Default Pro: $9.99
    let productName = 'CareerFlow Pro Upgrade';
    
    if (planType === 'executive') {
      priceInCents = 2999; // Executive: $29.99
      productName = 'CareerFlow Executive Upgrade';
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: req.user.email,
      client_reference_id: userId.toString(),
      
      // ⚠️ THIS IS THE MAGIC KEY: Attach the plan type to the session
      metadata: {
        purchasedPlan: planType 
      },
      
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: productName,
              description: `Unlock ${planType} features.`,
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.CLIENT_URL}/dashboard?payment=cancelled`,
    });

    res.status(200).json({ success: true, url: session.url });
  } catch (error) {
    console.error("Stripe Session Error:", error);
    res.status(500).json({ success: false, message: "Could not create checkout session" });
  }
};

// 2. The Webhook Listener (Silent background update)
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the successful payment
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.client_reference_id;
    
    // Read the sticky note we left in step 1
    const newPlan = session.metadata.purchasedPlan; // will be 'pro' or 'executive'

    try {
      // 1. DYNAMIC UPDATE: Inject the newPlan variable instead of a hardcoded string
      await User.findByIdAndUpdate(userId, { plan: newPlan });
      
      // 2. SAVE THE TRANSACTION
      await Transaction.create({
        user: userId,
        stripeSessionId: session.id,
        amount: session.amount_total / 100,
        status: 'completed'
      });
      
      console.log(`✅ Success: User ${userId} upgraded to ${newPlan.toUpperCase()}!`);
    } catch (dbError) {
      console.error("Database update failed after payment:", dbError);
    }
  }

  // Return a 200 response to Stripe so it doesn't keep retrying the webhook
  res.status(200).json({ received: true });
};

module.exports = { createCheckoutSession, handleStripeWebhook };