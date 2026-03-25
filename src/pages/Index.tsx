import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import LevelsOverview from "@/components/LevelsOverview";
import FeaturesSection from "@/components/FeaturesSection";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";

const Index = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <HeroSection />
    <LevelsOverview />
    <FeaturesSection />
    <PricingSection />
    <Footer />
  </div>
);

export default Index;
