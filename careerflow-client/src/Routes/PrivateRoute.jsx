import React from "react";
import { Navigate, useLocation } from "react-router"; 
import { useSelector } from "react-redux";

const PrivateRoute = ({ children }) => {
  const { accessToken } = useSelector((state) => state.auth);
  const location = useLocation();

  // If there is no token, kick them to the login page.
  // We use 'state' to remember where they were trying to go.
  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If they have a token, render the protected component (e.g., ProfilePage)
  return children;
};

export default PrivateRoute;