import React from 'react'
import { Outlet } from 'react-router'

const HomeLayout = () => {
  return (
   <>
    {/* Navbar */}
    
    {/* outlet */}
            {/* Here we will have the Home page content and Login/Register page content will load dynamically based on routes */}
            <Outlet/>
    {/* Footer */}
   
   </>
  )
}

export default HomeLayout
