"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Footer() {
  return (
    <motion.footer
      className="bg-gray-900 text-white py-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
        {/* Logo */}
        <div className="mb-6 md:mb-0">
          <h2 className="text-2xl font-bold">YourApp</h2>
          <p className="text-gray-400 text-sm">
            AI-powered text analysis made easy.
          </p>
        </div>

        {/* Links */}
        <nav className="flex space-x-6">
          <Link
            href="/features"
            className="text-gray-400 hover:text-white transition"
          >
            Features
          </Link>
          <Link
            href="/pricing"
            className="text-gray-400 hover:text-white transition"
          >
            Pricing
          </Link>
          <Link
            href="/faq"
            className="text-gray-400 hover:text-white transition"
          >
            FAQ
          </Link>
          <Link
            href="/contact"
            className="text-gray-400 hover:text-white transition"
          >
            Contact
          </Link>
        </nav>

        {/* Socials */}
        <div className="flex space-x-4 mt-6 md:mt-0">
          <a href="#" className="text-gray-400 hover:text-white transition">
            <i className="fab fa-twitter"></i>
          </a>
          <a href="#" className="text-gray-400 hover:text-white transition">
            <i className="fab fa-linkedin"></i>
          </a>
          <a href="#" className="text-gray-400 hover:text-white transition">
            <i className="fab fa-github"></i>
          </a>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center text-gray-500 text-sm mt-6">
        © {new Date().getFullYear()} YourApp. All rights reserved.
      </div>
    </motion.footer>
  );
}
