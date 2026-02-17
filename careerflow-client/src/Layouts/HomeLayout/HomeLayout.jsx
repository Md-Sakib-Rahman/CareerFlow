import React from 'react'
import { Outlet } from 'react-router'
import Footer from '../../Components/Shared/Footer/Footer'
import Navbar from '../../Components/Shared/Navbar/Navbar'

const HomeLayout = () => {
  return (
   <>
    {/* Navbar */}
    <Navbar/>
    {/* outlet */}
            {/* Here we will have the Home page content and Login/Register page content will load dynamically based on routes */}
            <Outlet/>
    {/* Footer */}
    <Footer/>
   </>
  )
}

export default HomeLayout
