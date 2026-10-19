const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User'); // Ensure this path is correct
const Transaction = require('../models/Transaction'); // 1. UNCOMMENTED THIS
const dbConnect = require('../config/db');

const ALLOWED_PLANS = ['pro', 'executive'];

// 1. Generate the Checkout URL
const createCheckoutSession = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Expect the frontend to send the chosen plan in the body
    // Default to 'pro' if nothing is sent, to prevent crashes
    const planType = req.body.planType || 'pro';

    if (!ALLOWED_PLANS.includes(planType)) {
      return res.status(400).json({ success: false, message: "Invalid plan type" });
    }

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
    console.error("Webhook signature verification failed:", err);
    return res.status(400).send("Webhook signature verification failed");
  }

  // Handle the successful payment
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.client_reference_id;
    
    // Read the sticky note we left in step 1
    const newPlan = session.metadata && session.metadata.purchasedPlan; // will be 'pro' or 'executive'

    if (!ALLOWED_PLANS.includes(newPlan)) {
      console.error(`Webhook: invalid purchasedPlan on session ${session.id}; ignoring`);
      return res.status(200).json({ received: true });
    }

    try {
      await dbConnect();

      // 1. SAVE THE TRANSACTION FIRST as 'pending': the unique stripeSessionId is the idempotency lock
      try {
        await Transaction.create({
          user: userId,
          stripeSessionId: session.id,
          amount: session.amount_total / 100,
          status: 'pending'
        });
      } catch (dbError) {
        if (!dbError || dbError.code !== 11000) throw dbError;
        const existing = await Transaction.findOne({ stripeSessionId: session.id });
        if (existing && existing.status === 'completed') {
          // Already fully processed: do not touch the user again
          return res.status(200).json({ received: true });
        }
        // Row is still pending: a previous attempt failed, so fall through and retry the update
      }

      // 2. DYNAMIC UPDATE: Inject the newPlan variable instead of a hardcoded string
      // Atomic and upgrade-only: matches only when the user's current plan ranks lower
      const lowerPlans = ['starter', ...ALLOWED_PLANS].slice(0, ['starter', ...ALLOWED_PLANS].indexOf(newPlan));
      await User.findOneAndUpdate(
        { _id: userId, plan: { $in: lowerPlans } },
        { plan: newPlan },
        { runValidators: true }
      );

      // 3. Only now is the purchase fully processed
      await Transaction.updateOne({ stripeSessionId: session.id }, { status: 'completed' });
      console.log(`✅ Success: User ${userId} upgraded to ${newPlan.toUpperCase()}!`);
    } catch (dbError) {
      // Leave the row pending so Stripe's retry can finish the job
      console.error("Webhook database error after payment:", dbError);
      return res.status(500).json({ received: false });
    }
  }

  // Return a 200 response to Stripe so it doesn't keep retrying the webhook
  res.status(200).json({ received: true });
};

module.exports = { createCheckoutSession, handleStripeWebhook };