import React from 'react'
import Navbar from '../../Components/Shared/Navbar/Navbar'
import Footer from '../../Components/Shared/Footer/Footer'
import HeroSection from '../../Components/HomeComponents/HeroSection'
import FeaturesSection from '../../Components/HomeComponents/FeaturesSection'
import TestimonialsSection from '../../Components/HomeComponents/TestimonialsSection'
import PricingSection from '../../Components/HomeComponents/PricingSection'
import Register from '../../Components/Auth/Register'

const HomePage = () => {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <Footer/>
    </div>
  )
}

export default HomePage
