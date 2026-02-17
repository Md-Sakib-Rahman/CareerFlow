import React from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { FaUserCircle, FaEnvelope, FaLock } from "react-icons/fa";

const Login = () => {
  const { register, handleSubmit } = useForm();

  const handleSignIn = (data) => {
    console.log("Login Data:", data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2D1B36] via-[#1F2451] to-[#637CB5] p-4">
      {/* গ্লাস কার্ড */}
      <div className="w-full max-w-[400px] bg-white/10 backdrop-blur-xl rounded-[3rem] p-10 shadow-2xl border border-white/10 text-white">
        {/* user icon*/}
        <div className="flex justify-center mb-10">
          <div className="bg-white/10 p-1 rounded-full">
            <FaUserCircle className="text-white/30 text-8xl" />
          </div>
        </div>

        <form onSubmit={handleSubmit(handleSignIn)} className="space-y-8">
          {/* Email Field */}
          <div className="relative flex items-center border-b border-white/40 pb-2 group focus-within:border-white transition-all">
            <FaEnvelope className="text-white/60 mr-3" />
            <input
              type="email"
              {...register("email", { required: true })}
              placeholder="Email ID"
              className="bg-transparent outline-none w-full placeholder:text-white/50 text-white"
            />
          </div>

          {/* Password Field */}
          <div className="relative flex items-center border-b border-white/40 pb-2 group focus-within:border-white transition-all">
            <FaLock className="text-white/60 mr-3" />
            <input
              type="password"
              {...register("password", { required: true })}
              placeholder="Password"
              className="bg-transparent outline-none w-full placeholder:text-white/50 text-white"
            />
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex justify-between items-center text-xs text-white/70">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="checkbox checkbox-xs border-white/40"
              />
              <span>Remember me</span>
            </label>
            <button type="button" className="italic hover:text-white">
              Forgot Password?
            </button>
          </div>

          {/* Login Button - Gradient Style */}
          <button className="w-full py-3 rounded-xl bg-gradient-to-r from-[#4A0E2E] to-[#5D78FF] font-bold tracking-widest uppercase hover:opacity-90 transition-all shadow-lg">
            LOGIN
          </button>
        </form>
        <div className="mt-8">
          <div className="divider before:bg-white/10 after:bg-white/10 text-[10px] opacity-50">
            OR
          </div>
        </div>
        <div className="mt-4 opacity-80">
          <button className="btn w-full bg-white text-black border-[#e5e5e5]">
            <svg
              aria-label="Google logo"
              width="16"
              height="16"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
            >
              <g>
                <path d="m0 0H512V512H0" fill="#fff"></path>
                <path
                  fill="#34a853"
                  d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"
                ></path>
                <path
                  fill="#4285f4"
                  d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"
                ></path>
                <path
                  fill="#fbbc02"
                  d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"
                ></path>
                <path
                  fill="#ea4335"
                  d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"
                ></path>
              </g>
            </svg>
            Login with Google
          </button>
        </div>

        <p className="text-center text-sm mt-8 text-white/60">
          Haven't account?{" "}
          <Link
            to="#"
            className="text-blue-300 font-bold hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
