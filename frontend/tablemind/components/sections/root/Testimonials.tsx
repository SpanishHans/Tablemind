"use client";
import { motion } from "framer-motion";
import { FaQuoteLeft, FaStar } from "react-icons/fa";

const testimonials = [
  {
    name: "Carlos M.",
    role: "Data Analyst",
    text: "This tool has saved me hours of manual work! The AI-powered analysis is fast and accurate.",
    rating: 5,
  },
  {
    name: "Ana G.",
    role: "Project Manager",
    text: "Being able to estimate costs before running an analysis is a game-changer. Highly recommended!",
    rating: 5,
  },
  {
    name: "Javier R.",
    role: "Researcher",
    text: "I love how easy it is to process Excel files and get insightful responses in seconds.",
    rating: 4,
  },
];

export default function Testimonials() {
  return (
    <section className="p-20 bg-gray-900 text-white text-center">
      <motion.h2
        className="text-4xl font-extrabold"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        What Our Users Say
      </motion.h2>

      <motion.p
        className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        Real feedback from professionals using our platform.
      </motion.p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10 max-w-5xl mx-auto">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={index}
            className="p-6 bg-gray-800 rounded-lg shadow-lg flex flex-col items-center text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
          >
            <FaQuoteLeft className="text-blue-400 text-3xl mb-3" />
            <p className="text-gray-300 italic">&ldquo;{testimonial.text}&rdquo;</p>
            <div className="flex mt-4">
              {[...Array(testimonial.rating)].map((_, i) => (
                <FaStar key={i} className="text-yellow-400 text-lg" />
              ))}
            </div>
            <h3 className="mt-4 text-xl font-semibold">{testimonial.name}</h3>
            <p className="text-gray-400">{testimonial.role}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
