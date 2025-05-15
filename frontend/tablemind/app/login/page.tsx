import Footer from "@/components/layout/Footer";
import Topbar from "@/components/layout/Topbar";
import FAQSection from "@/components/sections/root/FAQ";

export default function Login() {
  return (
    <div className="min-h-screen w-full bg-gray-900 text-white pt-20">
      <Topbar />
      <FAQSection />
      <Footer />
    </div>
  );
}
