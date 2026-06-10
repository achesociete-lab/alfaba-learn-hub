import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TwoPathsSection from "@/components/TwoPathsSection";
import WhyAlfaslSection from "@/components/WhyAlfaslSection";
import HomePricingSection from "@/components/HomePricingSection";
import HifzFinalCTA from "@/components/HifzFinalCTA";
import Footer from "@/components/Footer";

const Index = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <HeroSection />
    <TwoPathsSection />
    <WhyAlfaslSection />
    <HomePricingSection />
    <HifzFinalCTA />
    <Footer />
  </div>
);

export default Index;
