"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaCheckCircle } from "react-icons/fa";

const pricingPlans = [
  {
    name: "Free",
    price: "$0/month",
    features: [
      "Basic AI models",
      "Up to 10 queries per month",
      "Limited API access",
    ],
    buttonText: "Get Started",
    buttonStyle: "bg-gray-700 hover:bg-gray-600",
  },
  {
    name: "Pro",
    price: "$19/month",
    features: [
      "All AI models",
      "Unlimited queries",
      "Priority processing",
      "Token usage estimator",
    ],
    buttonText: "Start Free Trial",
    buttonStyle: "bg-blue-600 hover:bg-blue-500",
  },
  {
    name: "Enterprise",
    price: "Custom",
    features: [
      "Dedicated AI model tuning",
      "Team collaboration",
      "API integration support",
    ],
    buttonText: "Contact Us",
    buttonStyle: "bg-green-600 hover:bg-green-500",
  },
];

export default function Pricing() {
  return (
    <section className="p-20 bg-white text-center">
      <motion.h2
        className="text-4xl font-extrabold text-gray-900"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Pricing Plans
      </motion.h2>

      <motion.p
        className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        Choose the right plan for your needs.
      </motion.p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10 max-w-6xl mx-auto">
        {pricingPlans.map((plan, index) => (
          <motion.div
            key={index}
            className="p-6 bg-gray-100 rounded-lg shadow-lg flex flex-col items-center text-center border border-gray-200 h-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
          >
            <h3 className="text-2xl font-semibold text-gray-900">{plan.name}</h3>
            <p className="text-3xl font-bold text-blue-600 mt-3">{plan.price}</p>
            <ul className="mt-4 text-gray-600 text-left space-y-2 flex-grow pb-4">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center">
                  <FaCheckCircle className="text-green-500 mr-2" />
                  {feature}
                </li>
              ))}
            </ul>
            <Link href='/'>
              <button
                className={`mt-auto cursor-pointer px-6 py-2 text-white rounded-lg ${plan.buttonStyle}`}
              >
                {plan.buttonText}
              </button>
            </Link>
          </motion.div>
        ))}
      </div>

    </section>
  );
}
