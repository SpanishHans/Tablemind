"use client";
import { motion } from "framer-motion";
import { FaFileExcel, FaBrain, FaDollarSign, FaClock } from "react-icons/fa";

const features = [
  {
    icon: <FaFileExcel className="text-blue-500 text-4xl" />,
    title: "Excel File Processing",
    description: "Upload Excel files and analyze text in bulk with AI.",
  },
  {
    icon: <FaBrain className="text-purple-500 text-4xl" />,
    title: "Multiple AI Models",
    description: "Choose from different AI models to get the best analysis.",
  },
  {
    icon: <FaDollarSign className="text-green-500 text-4xl" />,
    title: "Cost Estimation",
    description:
      "Know exactly how much your request will cost before running it.",
  },
  {
    icon: <FaClock className="text-yellow-500 text-4xl" />,
    title: "Fast & Scalable",
    description: "Our system processes large datasets quickly and efficiently.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="p-20 bg-gray-900 text-white text-center">
      <motion.h2
        className="text-4xl font-extrabold"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Powerful Features at Your Fingertips
      </motion.h2>

      <motion.p
        className="mt-4 text-lg max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        Everything you need to analyze text in your Excel files effortlessly.
      </motion.p>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-10 max-w-5xl mx-auto">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className="p-6 bg-gray-800 rounded-lg shadow-lg flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
          >
            <div>{feature.icon}</div>
            <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
            <p className="mt-2 text-gray-400">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
