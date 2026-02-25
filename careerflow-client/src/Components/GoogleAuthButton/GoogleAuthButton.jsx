import React from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { googleSignInThunk } from "../../Redux/auth/authSlice";
import { toast } from "react-toastify";
import { FcGoogle } from "react-icons/fc"; // Add this for a real Google icon

const GoogleAuthButton = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      // NOTE: useGoogleLogin returns an access_token, not an idToken
      const resultAction = await dispatch(
        googleSignInThunk(tokenResponse.access_token)
      );

      if (googleSignInThunk.fulfilled.match(resultAction)) {
        toast.success("Welcome back, Sakib!");
        navigate("/profile");
      } else {
        toast.error(resultAction.payload || "Google Login failed");
      }
    },
    onError: () => toast.error("Google Login Failed"),
    // This ensures no automatic account pickers or popups appear
    flow: 'implicit', 
  });

  return (
    <div className="mt-4 w-full">
      <button 
        type="button"
        onClick={() => login()} 
        className="btn w-full btn-outline rounded-3xl flex items-center justify-center gap-3 border-base-300 hover:bg-base-300 transition-all font-bold tracking-wide shadow-sm"
      >
        <FcGoogle size={22} />
        <span className="opacity-80">Continue with Google</span>
      </button>
    </div>
  );
};

export default GoogleAuthButton;
