import { createBrowserRouter } from "react-router";
import HomeLayout from "../Layouts/HomeLayout/HomeLayout";
import HomePage from "../Pages/HomePage/HomePage";
import FAQPage from "../Pages/FAQPage/FAQPage";
import OurStoryPage from "../Pages/OurStory/OurStoryPage";
import LoadingSpinner from "../Components/Shared/LoadingSpinner/LoadingSpinner";

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
      }
    ]
  },
]);