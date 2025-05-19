"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function FinalCTA() {
  return (
    <motion.section
      className="p-20 bg-blue-600 text-center text-white"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="text-4xl font-extrabold">Get Started Today</h2>
      <p className="mt-4 text-lg max-w-2xl mx-auto">
        Start analyzing text in seconds. Upload your Excel file, choose a model,
        and let AI do the work!
      </p>

      <div className="mt-6">
        <Button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition">
          <Link href="/login">Login</Link>
        </Button>
      </div>
    </motion.section>
  );
}
