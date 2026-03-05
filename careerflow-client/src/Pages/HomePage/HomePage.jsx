
import HeroSection from '../../Components/HomeComponents/HeroSection'
import FeaturesSection from '../../Components/HomeComponents/FeaturesSection'
import TestimonialsSection from '../../Components/HomeComponents/TestimonialsSection'
import PricingSection from '../../Components/HomeComponents/PricingSection'
import DashboardPage from '../DashboardPage/DashboardPage';
import ContactUs from '../../Components/ContactUs/ContactUs';

const HomePage = () => {
  return (
    <div>
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <div>
        <h1 className='text-center text-2xl font-bold mt-1.5'>Dashboard</h1>
        <DashboardPage/>
      </div>
      <ContactUs/>
    </div>
  );
};

export default HomePage;
