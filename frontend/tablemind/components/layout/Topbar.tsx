"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaBars, FaTimes } from "react-icons/fa";
import { Button } from "@/components/ui/button";

export default function Topbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.header
      className="fixed top-0 left-0 w-full bg-gray-900 text-white shadow-md z-50"
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold">
          Logo
        </Link>
        
        <nav className="hidden md:flex space-x-6 items-center ">
          <Link href="/features" className="hover:text-gray-300 transition">
            Features
          </Link>
          <Link href="/pricing" className="hover:text-gray-300 transition">
            Pricing
          </Link>
          <Link href="/faq" className="hover:text-gray-300 transition">
            FAQ
          </Link>
          <Link href="/contact" className="hover:text-gray-300 transition">
            Contact
          </Link>

          <Link href="/login">
            <Button
              variant="secondary"
              className="cursor-pointer"
            >
              Log In
            </Button>
          </Link>
          
          <Link href="/register">
            <Button
              variant="default"
              className="bg-blue-600 border-blue-600 text-white hover:text-white hover:border-blue-500 hover:bg-blue-500 font-semibold cursor-pointer"
            >
              Get Started
            </Button>
          </Link>


        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <motion.div
          className="md:hidden bg-gray-800 p-6 absolute top-full left-0 w-full flex flex-col space-y-4 text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            href="/features"
            className="hover:text-gray-300 transition"
            onClick={() => setMenuOpen(false)}
          >
            Features
          </Link>
          
          <Link
            href="/pricing"
            className="hover:text-gray-300 transition"
            onClick={() => setMenuOpen(false)}
          >
            Pricing
          </Link>
          
          <Link
            href="/faq"
            className="hover:text-gray-300 transition"
            onClick={() => setMenuOpen(false)}
          >
            FAQ
          </Link>
          
          <Link
            href="/contact"
            className="hover:text-gray-300 transition"
            onClick={() => setMenuOpen(false)}
          >
            Contact
          </Link>
          
          <Link href="/login">
            <Button
              variant="outline"
              className="w-full text-gray-900 cursor-pointer"
            >
              Log In
            </Button>
          </Link>
          
          <Link href="/register">
            <Button
              variant="outline"
              className="w-full bg-blue-600 border-blue-600 text-white hover:text-white hover:border-blue-500 hover:bg-blue-500 font-semibold cursor-pointer"
            >
              Get Started
            </Button>
          </Link>
        </motion.div>
      )}
    </motion.header>
  );
}
