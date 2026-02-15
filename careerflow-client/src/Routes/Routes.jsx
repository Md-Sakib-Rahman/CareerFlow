import { createBrowserRouter } from "react-router";
import HomeLayout from "../Layouts/HomeLayout/HomeLayout";
import HomePage from "../Pages/HomePage/HomePage";

export const router = createBrowserRouter([
  {
    path: "/", // Landing page layout !
    element: <HomeLayout/>,
    children: [
      { 
        index: true,
        element: <HomePage/>,
      }
    //   Here Will be the Login and Register page routes in a certain layout and the Home page will be the default page when we load the website
    ]
    },
]);