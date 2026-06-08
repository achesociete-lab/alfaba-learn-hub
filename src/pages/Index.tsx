import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import ArabicLevelsSection from "@/components/ArabicLevelsSection";
import HifzPillarsSection from "@/components/HifzPillarsSection";
import HifzWhySection from "@/components/HifzWhySection";
import HifzPricingCTA from "@/components/HifzPricingCTA";
import LibrairieSection from "@/components/LibrairieSection";
import HifzFaqSection from "@/components/HifzFaqSection";
import HifzFinalCTA from "@/components/HifzFinalCTA";
import Footer from "@/components/Footer";

const Index = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <HeroSection />
    <FeaturesSection />
    <ArabicLevelsSection />
    <HifzPillarsSection />
    <HifzWhySection />
    <HifzPricingCTA />
    <LibrairieSection />
    <HifzFaqSection />
    <HifzFinalCTA />
    <Footer />
  </div>
);

export default Index;
