import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import LevelsOverview from "@/components/LevelsOverview";
import AIProfessorSection from "@/components/AIProfessorSection";
import FeaturesSection from "@/components/FeaturesSection";
import QuranBanner from "@/components/QuranBanner";
import TestimonialsSection from "@/components/TestimonialsSection";
import HomePricingSection from "@/components/HomePricingSection";
import Footer from "@/components/Footer";

const Index = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <HeroSection />
    <LevelsOverview />
    <AIProfessorSection />
    <FeaturesSection />
    <QuranBanner />
    <TestimonialsSection />
    <HomePricingSection />
    <Footer />
  </div>
);

export default Index;
