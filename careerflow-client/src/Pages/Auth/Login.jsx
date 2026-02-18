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
    <div className="min-h-screen flex items-center justify-center bg-base-100 text-base-content p-4 transition-colors duration-300">
      
      {/* Glass Card */}
      <div className="w-full max-w-md bg-base-200/50 backdrop-blur-xl rounded-[3rem] p-10 shadow-2xl border border-base-300">
        
        {/* User Icon */}
        <div className="flex justify-center mb-10">
          <div className="bg-primary/10 p-2 rounded-full">
            <FaUserCircle className="text-primary/30 text-8xl" />
          </div>
        </div>
        <h1 className="text-center text-2xl font-bold mb-6">User Login</h1>

        <form onSubmit={handleSubmit(handleSignIn)} className="space-y-8">
          
          {/* Email Field */}
          <div className="relative flex items-center border-b border-base-300 pb-2 focus-within:border-primary transition-all">
            <FaEnvelope className="opacity-60 mr-3" />
            <input
              type="email"
              {...register("email", { required: true })}
              placeholder="Email ID"
              className="bg-transparent outline-none w-full placeholder-base-content/50 dark:placeholder-white/50"
            />
          </div>

          {/* Password Field */}
          <div className="relative flex items-center border-b border-base-300 pb-2 focus-within:border-primary transition-all">
            <FaLock className="opacity-60 mr-3" />
            <input
              type="password"
              {...register("password", { required: true })}
              placeholder="Password"
              className="bg-transparent outline-none w-full placeholder-base-content/50 dark:placeholder-white/50"
            />
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex justify-between items-center text-xs opacity-70">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="checkbox checkbox-xs"
              />
              <span>Remember me</span>
            </label>
            <button type="button" className="italic hover:text-primary">
              Forgot Password?
            </button>
          </div>

          {/* Login Button */}
          <button className="btn-primary w-full py-3 rounded-xl font-bold tracking-widest uppercase shadow-lg">
            LOGIN
          </button>
        </form>

        <div className="mt-8">
          <div className="divider text-[10px] opacity-50">
            OR
          </div>
        </div>

        {/* Google Button */}
        <div className="mt-4 opacity-90">
          <button className="btn w-full btn-outline">
            Login with Google
          </button>
        </div>

        <p className="text-center text-sm mt-8 opacity-80">
          Haven't account?{" "}
          <Link
            to="/register"
            className="text-secondary font-bold hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
