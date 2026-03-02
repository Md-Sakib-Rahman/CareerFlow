import { createBrowserRouter } from "react-router";
import HomeLayout from "../Layouts/HomeLayout/HomeLayout";
import HomePage from "../Pages/HomePage/HomePage";
import FAQPage from "../Pages/FAQPage/FAQPage";
import OurStoryPage from "../Pages/OurStory/OurStoryPage";
import LoadingSpinner from "../Components/Shared/LoadingSpinner/LoadingSpinner";
import WhyAsk from "../Pages/WhyAskPage/WhyAsk";
import Login from "../Pages/Auth/Login";
import Register from "../Pages/Auth/Register";
import ProfilePage from "../Pages/ProfilePage/ProfilePage";
import PrivateRoute from "./PrivateRoute";
import DashboardLayout from "../Layouts/DashboardLayout/DashboardLayout";
import DashboardPage from "../Pages/DashboardPage/DashboardPage";
import ApplicationsPage from "../Pages/Applications/ApplicationsPage";
import BoardsPage from "../Pages/Boards/BoardsPage";
import ResetPassword from "../Pages/Auth/ResetPassword";
import ForgotPassword from "../Pages/Auth/ForgotPassword";

// 1. ADDED YOUR ANALYTICS IMPORT BACK
import Analytics from "../Components/Dashboard/Analytics/Analytics";

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
        element: <WhyAsk />
      },
      {
        path: "/login",
        element: <Login />
      },
      {
        path: "/register",
        element: <Register />
      },
      {
        path: "/reset-password",
        element: <ResetPassword />
      },
      {
        path: "/forgot-password",
        element: <ForgotPassword />
      },
    ]
  },
  {
    element: (
      <PrivateRoute>
        <DashboardLayout />
      </PrivateRoute>
    ),
    children: [
      {
        path: "/profile",
        element: <ProfilePage />
      },
      {
        path: "/dashboard",
        element: <DashboardPage />
      },
      {
        path: "/applications",
        element: <ApplicationsPage />
      },
      {
        path: "/boards",
        element: <BoardsPage />
      },
      // 2. ADDED YOUR ANALYTICS ROUTE BACK INTO THE DASHBOARD
      {
        path: "/analytics",
        element: <Analytics />
      }
    ]
  },
]);