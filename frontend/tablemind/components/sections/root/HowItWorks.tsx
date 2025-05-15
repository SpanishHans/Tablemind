import Image from "next/image";

export default function HowItWorks() {
  return (
    <section className="relative bg-gray-100 text-gray-800">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
        
        {/* Left - Image */}
        <div className="md:w-7/12 relative bg-white">
          <Image 
            src="/images/how-it-works.jpg" 
            alt="How it works" 
            width={700} 
            height={450} 
            className="rounded-lg shadow-lg"
          />
        </div>

        {/* Right - Content Box (Overlayed) */}
        <div className="md:w-7/12 relative bg-white">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-600 mb-6">
            Our AI-powered system simplifies your workflow. Upload your data, select a model, 
            and receive instant, actionable insights.
          </p>
        </div>

      </div>
    </section>
  );
}
