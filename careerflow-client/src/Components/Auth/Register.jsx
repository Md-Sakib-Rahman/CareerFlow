import React from "react";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { FaUser, FaEnvelope, FaLock, FaImage, FaUserPlus } from "react-icons/fa";

const Register = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleRegister = (data) => {
    console.log("Registration Data:", data);
  };

  return (
    // Background with gradient and centered card
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2D1B36] via-[#1F2451] to-[#637CB5] p-22">
      <title>Register</title>
      {/* Glass card design */}
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-[3rem] p-8 shadow-2xl border border-white/10 text-white">
        
        <div className="flex justify-center mb-6">
           <div className="bg-white/10 p-4 rounded-full">
              <FaUserPlus className="text-white/40 text-5xl" />
           </div>
        </div>

        <h2 className="text-center text-2xl font-bold mb-2">
          Welcome to <span className="text-purple-400">Career</span>Flow
        </h2>
        <p className="text-center text-white/60 mb-8">Please Register</p>

        <form onSubmit={handleSubmit(handleRegister)} className="space-y-5">
          
          {/* Name Field */}
          <div className="relative border-b border-white/30 pb-1">
            <label className="text-xs text-white/50 block">Name</label>
            <div className="flex items-center">
              <FaUser className="mr-2 text-white/40" />
              <input
                type="text"
                {...register("name", { required: true })}
                className="bg-transparent outline-none w-full py-1 placeholder:text-white/20"
                placeholder="Your name"
              />
            </div>
            {errors.name && <p className="text-red-400 text-[10px] mt-1">Name is required</p>}
          </div>

          {/* Photo Field */}
          <div className="relative border-b border-white/30 pb-1">
            <label className="text-xs text-white/50 block">Photo</label>
            <div className="flex items-center">
              <FaImage className="mr-2 text-white/40" />
              <input
                type="file"
                {...register("photo", { required: true })}
                className="bg-transparent outline-none w-full py-1 text-xs file:hidden cursor-pointer"
              />
            </div>
            {errors.photo && <p className="text-red-400 text-[10px] mt-1">Photo is required</p>}
          </div>

          {/* Email Field */}
          <div className="relative border-b border-white/30 pb-1">
            <label className="text-xs text-white/50 block">Email</label>
            <div className="flex items-center">
              <FaEnvelope className="mr-2 text-white/40" />
              <input
                type="email"
                {...register("email", { required: true })}
                className="bg-transparent outline-none w-full py-1 placeholder:text-white/20"
                placeholder="Email ID"
              />
            </div>
            {errors.email && <p className="text-red-400 text-[10px] mt-1">Email is required</p>}
          </div>

          {/* Password Field */}
          <div className="relative border-b border-white/30 pb-1">
            <label className="text-xs text-white/50 block">Password</label>
            <div className="flex items-center">
              <FaLock className="mr-2 text-white/40" />
              <input
                type="password"
                {...register("password", {
                  required: true,
                  minLength: 8,
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
                })}
                className="bg-transparent outline-none w-full py-1 placeholder:text-white/20"
                placeholder="Password"
              />
            </div>
            {errors.password && <p className="text-red-400 text-[10px] mt-1">Check password requirements</p>}
          </div>

          <button className="w-full py-3 mt-4 rounded-xl bg-gradient-to-r from-[#4A0E2E] to-[#5D78FF] font-bold tracking-widest uppercase hover:opacity-90 transition-all shadow-lg text-white">
            Register
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-white/60">
          Already have an account?{" "}
          <Link to="#" className="text-blue-300 font-bold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;