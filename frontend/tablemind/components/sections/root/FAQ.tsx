"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";

const faqs = [
  {
    question: "How does this platform work?",
    answer:
      "You upload an Excel file, select a column for analysis, choose a model, and get AI-generated responses.",
  },
  {
    question: "Is there a free plan?",
    answer:
      "Yes! The Free plan lets you process up to 10 queries per month with limited model access.",
  },
  {
    question: "How is pricing calculated?",
    answer:
      "We estimate costs based on token usage before running the operation, so you always know what you’re paying.",
  },
  {
    question: "Can I use my own API key?",
    answer:
      "Yes! You can bring your own API key and integrate models like OpenAI, DeepSeek, or Cohere.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="p-20 bg-gray-100 text-center">
      <motion.h2
        className="text-4xl font-extrabold text-gray-900"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Frequently Asked Questions
      </motion.h2>

      <motion.p
        className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        Have questions? We&rsquo;ve got answers.
      </motion.p>

      <div className="max-w-3xl mx-auto mt-10 space-y-4">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            className="bg-white rounded-lg shadow-md p-5 cursor-pointer text-left"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            onClick={() => toggleFAQ(index)}
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {faq.question}
              </h3>
              <FaChevronDown
                className={`text-gray-600 transform transition-transform ${openIndex === index ? "rotate-180" : ""}`}
              />
            </div>
            {openIndex === index && (
              <p className="mt-3 text-gray-700">{faq.answer}</p>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
