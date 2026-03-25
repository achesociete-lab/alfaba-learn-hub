import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PricingSection from "@/components/PricingSection";

const Tarifs = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-24">
      <PricingSection />
    </main>
    <Footer />
  </div>
);

export default Tarifs;
