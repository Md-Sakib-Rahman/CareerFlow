
import HeroSection from '../../Components/HomeComponents/HeroSection'
import FeaturesSection from '../../Components/HomeComponents/FeaturesSection'
import TestimonialsSection from '../../Components/HomeComponents/TestimonialsSection'
import PricingSection from '../../Components/HomeComponents/PricingSection'
import StaticDashboardPreview from '../../Components/StaticDashboardPreview/StaticDashboardPreview';

const HomePage = () => {
  return (
    <div>
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <StaticDashboardPreview />
    </div>
  );
};

export default HomePage;
