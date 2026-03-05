
import HeroSection from '../../Components/HomeComponents/HeroSection'
import FeaturesSection from '../../Components/HomeComponents/FeaturesSection'
import TestimonialsSection from '../../Components/HomeComponents/TestimonialsSection'
import PricingSection from '../../Components/HomeComponents/PricingSection'

import ContactUs from '../../Components/ContactUs/ContactUs';
import DashBoardComponent from '../../Components/Dashboard/DashBoardComponent';

const HomePage = () => {
  return (
    <div>
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <DashBoardComponent/>
      <ContactUs/>
    </div>
  );
};

export default HomePage;
