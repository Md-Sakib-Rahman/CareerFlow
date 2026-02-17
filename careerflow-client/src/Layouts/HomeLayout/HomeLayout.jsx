import React from 'react'
import { Outlet } from 'react-router'
<<<<<<< HEAD
import Footer from '../../Components/Shared/Footer/Footer'
import Navbar from '../../Components/Shared/Navbar/Navbar'
=======
import Navbar from '../../Components/Shared/Navbar/Navbar'
import Footer from '../../Components/Shared/Footer/Footer'
>>>>>>> a5ea38c0cb88b9a49b510487df131086ba7d106f

const HomeLayout = () => {
  return (
   <>
    {/* Navbar */}
    <Navbar/>
    {/* outlet */}
            {/* Here we will have the Home page content and Login/Register page content will load dynamically based on routes */}
            <Outlet/>
    {/* Footer */}
<<<<<<< HEAD
    <Footer/>
=======
   <Footer/>
>>>>>>> a5ea38c0cb88b9a49b510487df131086ba7d106f
   </>
  )
}

export default HomeLayout
