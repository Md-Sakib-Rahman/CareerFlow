import { createBrowserRouter } from "react-router";
import HomeLayout from "../Layouts/HomeLayout/HomeLayout";
import HomePage from "../Pages/HomePage/HomePage";
import FAQPage from "../Pages/FAQPage/FAQPage";
import OurStoryPage from "../Pages/OurStory/OurStoryPage";
import LoadingSpinner from "../Components/Shared/LoadingSpinner/LoadingSpinner";
import WhyAsk from "../Pages/WhyAskPage/WhyAsk";
import Login from "../Pages/Auth/Login"
import Register from "../Pages/Auth/Register";
export const router = createBrowserRouter([
  {
    path: "/", // Landing page layout !
    element: <HomeLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "/faq",
        element: <FAQPage />,
      },
      {
        path: "/our-story",
        element: <OurStoryPage />,
      },
      {
        path: "/whyus",
        element: <WhyAsk/>
      },
      {
        path: "/login",
        element: <Login/>
      },
      {
        path: "/register",
        element: <Register/>
      },
      
    ]
  },
]);