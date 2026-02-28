import React from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { googleSignInThunk } from "../../Redux/auth/authSlice";
import { toast } from "react-toastify";
import { FcGoogle } from "react-icons/fc";

const GoogleAuthButton = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      // Once the popup is successful, the "User Activation" hurdle is cleared.
      const resultAction = await dispatch(
        googleSignInThunk(tokenResponse.access_token)
      );

      if (googleSignInThunk.fulfilled.match(resultAction)) {
        toast.success("Welcome back!");
        navigate("/dashboard");
      } else {
        toast.error(resultAction.payload || "Google Login failed");
      }
    },
    onError: (error) => {
      console.error("Google Login Error:", error);
      toast.error("Google Login was interrupted.");
    },
  });

  return (
    <div className="mt-4 w-full">
      <button
        type="button"
        // CRITICAL FIX: Direct execution in the onClick event.
        // Do NOT wrap this in another function like handleLogin()
        onClick={() => login()} 
        disabled={loading}
        className={`btn w-full btn-outline rounded-3xl flex items-center justify-center gap-3 border-base-300 hover:bg-base-300 transition-all font-bold tracking-wide shadow-sm 
          ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
      >
        {loading ? (
          <span className="loading loading-spinner loading-sm text-primary"></span>
        ) : (
          <>
            <FcGoogle size={22} />
            <span className="opacity-80">Continue with Google</span>
          </>
        )}
      </button>
    </div>
  );
};

export default GoogleAuthButton;
