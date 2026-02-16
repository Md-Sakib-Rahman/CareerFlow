import React from 'react'
import Navbar from '../../components/shared/Navbar'
import Footer from '../../components/shared/Footer'
import HeroSection from '../../components/HomeComponents/HeroSection'
import FeaturesSection from '../../components/HomeComponents/FeaturesSection'
import TestimonialsSection from '../../components/HomeComponents/TestimonialsSection'
import PricingSection from '../../components/HomeComponents/PricingSection'

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
