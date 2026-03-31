import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import LevelsOverview from "@/components/LevelsOverview";
import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";

const Index = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <HeroSection />
    <LevelsOverview />
    <FeaturesSection />
    <Footer />
  </div>
);

export default Index;
