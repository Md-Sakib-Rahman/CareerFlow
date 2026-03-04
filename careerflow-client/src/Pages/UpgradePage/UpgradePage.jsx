import React, { useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { FaCheckCircle, FaCrown, FaBriefcase, FaPaperPlane } from "react-icons/fa";
import { privateApi } from "../../Axios/axiosInstance";
import { toast } from "react-toastify";

const UpgradePage = () => {
  const { user } = useSelector((state) => state.auth);
  const [loadingPlan, setLoadingPlan] = useState(null);

  // Normalize the user's current plan to lowercase to match our IDs
  const currentPlan = user?.plan?.toLowerCase() || "starter";

  const plans = [
    {
      id: "starter",
      name: "Starter",
      icon: <FaPaperPlane size={24} />,
      price: "Free",
      description: "Essential tools to get your job search organized.",
      features: ["Basic Kanban Board", "Up to 50 Applications", "Standard Support"],
    },
    {
      id: "pro",
      name: "Pro",
      icon: <FaCrown size={24} />,
      price: "$9.99",
      description: "Unlock advanced analytics and unlimited tracking.",
      features: ["Unlimited Applications", "Advanced Analytics Dashboard", "Export Reports to PDF"],
    },
    {
      id: "executive",
      name: "Executive",
      icon: <FaBriefcase size={24} />,
      price: "$29.99",
      description: "The ultimate suite with AI coaching and priority matching.",
      features: ["Everything in Pro", "AI Resume Matching", "Priority Support 24/7"],
    }
  ];

  const handleCheckout = async (planId) => {
    setLoadingPlan(planId);
    try {
      // Pass the selected plan type to our backend Stripe controller
      const res = await privateApi.post('/api/payments/create-checkout-session', {
        planType: planId
      });
      
      if (res.data.success && res.data.url) {
        window.location.href = res.data.url; // Redirect to Stripe
      }
    } catch (error) {
      console.error("Payment routing failed:", error);
      toast.error("Could not initiate checkout. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-base-100 p-10 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Blurs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="text-center z-10 mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">Choose Your Path</h1>
        <p className="opacity-70 max-w-xl mx-auto">
          Upgrade your account to unlock advanced features and accelerate your career growth.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full z-10">
        {plans.map((plan, index) => {
          const isCurrentPlan = currentPlan === plan.id;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-base-100/80 backdrop-blur-2xl p-8 rounded-[2rem] shadow-xl border flex flex-col ${
                isCurrentPlan 
                  ? "border-base-300 opacity-60 grayscale-[0.5]" // Grayed out styling
                  : "border-primary/20 hover:border-primary transition-colors"
              }`}
            >
              {isCurrentPlan && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-base-300 text-base-content text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest shadow-lg">
                  Current Plan
                </div>
              )}

              <div className={`p-4 rounded-2xl w-fit mb-6 ${isCurrentPlan ? 'bg-base-300 text-base-content' : 'bg-primary/10 text-primary'}`}>
                {plan.icon}
              </div>
              
              <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
              <div className="text-4xl font-black mb-4">
                {plan.price}
                {plan.price !== "Free" && <span className="text-sm font-normal opacity-50">/lifetime</span>}
              </div>
              <p className="text-sm opacity-70 mb-8 h-10">{plan.description}</p>

              <div className="flex-1 space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm font-medium">
                    <FaCheckCircle className={isCurrentPlan ? "text-base-content/50" : "text-primary"} />
                    {feature}
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleCheckout(plan.id)}
                disabled={isCurrentPlan || loadingPlan === plan.id || plan.price === "Free"}
                className={`btn w-full rounded-xl ${
                  isCurrentPlan 
                    ? "btn-disabled bg-base-300" 
                    : "btn-primary shadow-lg shadow-primary/20"
                }`}
              >
                {loadingPlan === plan.id ? (
                  <span className="loading loading-spinner"></span>
                ) : isCurrentPlan ? (
                  "Active"
                ) : (
                  "Upgrade Now"
                )}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default UpgradePage;