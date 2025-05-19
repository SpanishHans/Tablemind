import HeroSection from "@/components/sections/root/Hero";
import FeaturesSection from "@/components/sections/root/Features";
import HowItWorks from "@/components/sections/root/HowItWorks";
import Testimonials from "@/components/sections/root/Testimonials";
import FAQSection from "@/components/sections/root/FAQ";
import Pricing from "@/components/sections/root/Pricing";
import FinalCTA from "@/components/sections/root/FinalCTA";
import Footer from "@/components/layout/Footer";
import Topbar from "@/components/layout/Topbar";

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-gray-900 pt-20 text-white">
      <Topbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <FAQSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}
