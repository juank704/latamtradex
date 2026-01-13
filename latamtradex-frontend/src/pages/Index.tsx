import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CategoriesSection from "@/components/CategoriesSection";
import OrderTrackingSection from "@/components/OrderTrackingSection";
import FeaturedSuppliers from "@/components/FeaturedSuppliers";
import BenefitsSection from "@/components/BenefitsSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <CategoriesSection />
        <OrderTrackingSection />
        <FeaturedSuppliers />
        <BenefitsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
