import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HifzPillarsSection from "@/components/HifzPillarsSection";
import HifzWhySection from "@/components/HifzWhySection";
import ArabicLevelsSection from "@/components/ArabicLevelsSection";
import HifzPricingCTA from "@/components/HifzPricingCTA";
import HifzFaqSection from "@/components/HifzFaqSection";
import HifzFinalCTA from "@/components/HifzFinalCTA";
import Footer from "@/components/Footer";

const Index = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <HeroSection />
    <HifzPillarsSection />
    <HifzWhySection />
    <ArabicLevelsSection />
    <HifzPricingCTA />
    <HifzFaqSection />
    <HifzFinalCTA />
    <Footer />
  </div>
);

export default Index;
