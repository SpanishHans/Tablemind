"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="h-screen flex flex-col items-center justify-center text-center bg-gradient-to-b from-gray-900/90 to-gray-800/90 text-white p-20">
      <motion.h1
        className="text-5xl font-extrabold leading-tight"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        AI-Powered Text Analysis
        <span className="text-blue-400"> Made Simple</span>
      </motion.h1>

      <motion.p
        className="mt-4 text-lg max-w-xl"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        Upload your Excel files, analyze text with AI, and get instant insights.
      </motion.p>

      <motion.div
        className="mt-6"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.6 }}
      >
        <Link href="/register">
          <Button
            variant="default"
            className="p-7 font-semibold cursor-pointer"
          >
            Get Started
          </Button>
        </Link>
      </motion.div>
    </section>
  );
}
