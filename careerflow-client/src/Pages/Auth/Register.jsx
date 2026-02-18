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
    <div className="min-h-screen flex items-center justify-center bg-base-100 text-base-content p-6 transition-colors duration-300">
      <title>Register</title>
      
      <div className="w-full max-w-md bg-base-200/50 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl border border-base-300">
        
        <div className="flex justify-center mb-6">
           <div className="bg-primary/10 p-4 rounded-full">
              <FaUserPlus className="text-primary text-5xl" />
           </div>
        </div>

        <h2 className="text-center text-2xl font-bold mb-2">
          Welcome to <span className="text-primary">Career</span>Flow
        </h2>
        <p className="text-center opacity-60 mb-8 font-medium">Please Register</p>

        <form onSubmit={handleSubmit(handleRegister)} className="space-y-5">
          
          {/* Name Field */}
          <div className="relative border-b border-base-300 pb-1 focus-within:border-primary transition-colors">
            <label className="text-xs opacity-70 font-semibold block">Name</label>
            <div className="flex items-center">
              <FaUser className="mr-2 opacity-60" />
              <input
                type="text"
                {...register("name", { required: true })}
                /* placeholder color logic: 
                   placeholder-base-content (Light mode এ কালো/ডার্ক)
                   dark:placeholder-white (Dark mode এ সাদা)
                */
                className="bg-transparent outline-none w-full py-1 placeholder-base-content/50 dark:placeholder-white/50"
                placeholder="Your name"
              />
            </div>
            {errors.name && <p className="text-error text-[10px] mt-1">Name is required</p>}
          </div>

          {/* Photo Field */}
          <div className="relative border-b border-base-300 pb-1">
            <label className="text-xs opacity-70 font-semibold block">Photo</label>
            <div className="flex items-center">
              <FaImage className="mr-2 opacity-60" />
              <input
                type="file"
                {...register("photo", { required: true })}
                className="bg-transparent outline-none w-full py-1 text-xs file:hidden cursor-pointer"
              />
            </div>
            {errors.photo && <p className="text-error text-[10px] mt-1">Photo is required</p>}
          </div>

          {/* Email Field */}
          <div className="relative border-b border-base-300 pb-1 focus-within:border-primary">
            <label className="text-xs opacity-70 font-semibold block">Email</label>
            <div className="flex items-center">
              <FaEnvelope className="mr-2 opacity-60" />
              <input
                type="email"
                {...register("email", { required: true })}
                className="bg-transparent outline-none w-full py-1 placeholder-base-content/50 dark:placeholder-white/50"
                placeholder="Email ID"
              />
            </div>
            {errors.email && <p className="text-error text-[10px] mt-1">Email is required</p>}
          </div>

          {/* Password Field */}
          <div className="relative border-b border-base-300 pb-1 focus-within:border-primary">
            <label className="text-xs opacity-70 font-semibold block">Password</label>
            <div className="flex items-center">
              <FaLock className="mr-2 opacity-60" />
              <input
                type="password"
                {...register("password", { required: true, minLength: 8 })}
                className="bg-transparent outline-none w-full py-1 placeholder-base-content/50 dark:placeholder-white/50"
                placeholder="Password"
              />
            </div>
            {errors.password && <p className="text-error text-[10px] mt-1">Check password requirements</p>}
          </div>

          <button className="btn-primary w-full py-3 mt-4 font-bold tracking-widest uppercase shadow-lg">
            Register
          </button>
        </form>

        <p className="text-center text-sm mt-6 opacity-80">
          Already have an account?{" "}
          <Link to="/login" className="text-secondary font-bold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;