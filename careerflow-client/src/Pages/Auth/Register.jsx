import React, { useState } from "react";
import { Link, useNavigate } from "react-router"; 
import { useForm } from "react-hook-form";
import { FaUser, FaEnvelope, FaLock, FaImage, FaUserPlus, FaKey } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { registerUser, sendOtp } from "../../Redux/auth/authSlice";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, otpSent } = useSelector((state) => state.auth);
  
  // Local state for the image upload process
  const [imageUploading, setImageUploading] = useState(false);

  const { register, handleSubmit, getValues, trigger, formState: { errors } } = useForm();

  // Step 1: Request OTP
  const handleSendOtp = async () => {
    const isValid = await trigger("email"); 
    if (!isValid) return;

    const email = getValues("email");
    const resultAction = await dispatch(sendOtp(email));
    
    if (sendOtp.fulfilled.match(resultAction)) {
      toast.success("OTP sent to your email!");
    } else {
      toast.error(resultAction.payload || "Failed to send OTP");
    }
  };

  // Step 2: Final Registration with ImgBB
  const handleRegister = async (data) => {
    if (!otpSent) {
      handleSendOtp();
      return;
    }

    try {
      setImageUploading(true);

      // 1. Prepare the image file for ImgBB
      const imageFile = data.photo[0];
      const formData = new FormData();
      formData.append("image", imageFile);

      // 2. Upload to ImgBB via fetch
      const imgbbKey = import.meta.env.VITE_IMGBB_API_KEY;
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
        method: "POST",
        body: formData,
      });
      
      const imgData = await response.json();

      if (!imgData.success) {
        toast.error("Image upload failed! Please try a different image.");
        setImageUploading(false);
        return;
      }

      // 3. Extract the clean URL from ImgBB
      const uploadedImageUrl = imgData.data.display_url;

      // 4. Construct the final user payload
      const userData = {
        name: data.name,
        email: data.email,
        password: data.password,
        otp: data.otp,
        plan: "starter", 
        imageUrl: uploadedImageUrl, // Inserted the ImgBB URL here
      };

      // 5. Dispatch to your Redux Store
      const resultAction = await dispatch(registerUser(userData));
      
      if (registerUser.fulfilled.match(resultAction)) {
        toast.success("Registration Successful!");
        navigate("/profile");
      } else {
        toast.error(resultAction.payload || "Registration failed");
      }
    } catch (error) {
      toast.error("Something went wrong during the upload process.");
    } finally {
      setImageUploading(false);
    }
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
                disabled={otpSent || imageUploading}
                {...register("name", { required: "Name is required" })}
                className="bg-transparent outline-none w-full py-1 placeholder-base-content/50 dark:placeholder-white/50 disabled:opacity-50"
                placeholder="Your name"
              />
            </div>
            {errors.name && <p className="text-error text-[10px] mt-1">{errors.name.message}</p>}
          </div>

          {/* Photo Field */}
          <div className="relative border-b border-base-300 pb-1">
            <label className="text-xs opacity-70 font-semibold block">Photo</label>
            <div className="flex items-center">
              <FaImage className="mr-2 opacity-60" />
              <input
                type="file"
                accept="image/*"
                disabled={otpSent || imageUploading}
                {...register("photo", { required: "Photo is required" })}
                className="bg-transparent outline-none w-full py-1 text-xs file:hidden cursor-pointer disabled:opacity-50"
              />
            </div>
            {errors.photo && <p className="text-error text-[10px] mt-1">{errors.photo.message}</p>}
          </div>

          {/* Email Field */}
          <div className="relative border-b border-base-300 pb-1 focus-within:border-primary">
            <label className="text-xs opacity-70 font-semibold block">Email</label>
            <div className="flex items-center">
              <FaEnvelope className="mr-2 opacity-60" />
              <input
                type="email"
                disabled={otpSent || imageUploading}
                {...register("email", { 
                  required: "Email is required",
                  pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" }
                })}
                className="bg-transparent outline-none w-full py-1 placeholder-base-content/50 dark:placeholder-white/50 disabled:opacity-50"
                placeholder="Email ID"
              />
            </div>
            {errors.email && <p className="text-error text-[10px] mt-1">{errors.email.message}</p>}
          </div>

          {/* Password Field */}
          <div className="relative border-b border-base-300 pb-1 focus-within:border-primary">
            <label className="text-xs opacity-70 font-semibold block">Password</label>
            <div className="flex items-center">
              <FaLock className="mr-2 opacity-60" />
              <input
                type="password"
                disabled={otpSent || imageUploading}
                {...register("password", { required: "Password is required", minLength: { value: 6, message: "Min 6 chars" } })}
                className="bg-transparent outline-none w-full py-1 placeholder-base-content/50 dark:placeholder-white/50 disabled:opacity-50"
                placeholder="Password"
              />
            </div>
            {errors.password && <p className="text-error text-[10px] mt-1">{errors.password.message}</p>}
          </div>

          {/* Dynamic OTP Field */}
          {otpSent && (
            <div className="relative border-b border-base-300 pb-1 focus-within:border-primary transition-colors animate-fade-in">
              <label className="text-xs opacity-70 font-semibold block text-primary">Verification Code</label>
              <div className="flex items-center">
                <FaKey className="mr-2 text-primary opacity-80" />
                <input
                  type="text"
                  disabled={imageUploading}
                  {...register("otp", { required: "OTP is required" })}
                  className="bg-transparent outline-none w-full py-1 placeholder-base-content/50 dark:placeholder-white/50"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                />
              </div>
              {errors.otp && <p className="text-error text-[10px] mt-1">{errors.otp.message}</p>}
            </div>
          )}

          {/* Dynamic Submit Button */}
          <button 
            type="submit" 
            disabled={loading || imageUploading}
            className="btn-primary w-full py-3 mt-4 font-bold tracking-widest uppercase shadow-lg disabled:opacity-70 flex justify-center items-center"
          >
            {imageUploading ? (
              <>
                <span className="loading loading-spinner loading-sm mr-2"></span> Uploading Image...
              </>
            ) : loading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : otpSent ? (
              "Verify & Register"
            ) : (
              "Send OTP"
            )}
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
// import React from "react";
// import { Link } from "react-router"; 
// import { useForm } from "react-hook-form";
// import { FaUser, FaEnvelope, FaLock, FaImage, FaUserPlus } from "react-icons/fa";

// const Register = () => {
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm();

//   const handleRegister = (data) => {
//     console.log("Registration Data:", data);
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-base-100 text-base-content p-6 transition-colors duration-300">
//       <title>Register</title>
      
//       <div className="w-full max-w-md bg-base-200/50 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl border border-base-300">
        
//         <div className="flex justify-center mb-6">
//            <div className="bg-primary/10 p-4 rounded-full">
//               <FaUserPlus className="text-primary text-5xl" />
//            </div>
//         </div>

//         <h2 className="text-center text-2xl font-bold mb-2">
//           Welcome to <span className="text-primary">Career</span>Flow
//         </h2>
//         <p className="text-center opacity-60 mb-8 font-medium">Please Register</p>

//         <form onSubmit={handleSubmit(handleRegister)} className="space-y-5">
          
//           {/* Name Field */}
//           <div className="relative border-b border-base-300 pb-1 focus-within:border-primary transition-colors">
//             <label className="text-xs opacity-70 font-semibold block">Name</label>
//             <div className="flex items-center">
//               <FaUser className="mr-2 opacity-60" />
//               <input
//                 type="text"
//                 {...register("name", { required: true })}
//                 /* placeholder color logic: 
//                    placeholder-base-content (Light mode এ কালো/ডার্ক)
//                    dark:placeholder-white (Dark mode এ সাদা)
//                 */
//                 className="bg-transparent outline-none w-full py-1 placeholder-base-content/50 dark:placeholder-white/50"
//                 placeholder="Your name"
//               />
//             </div>
//             {errors.name && <p className="text-error text-[10px] mt-1">Name is required</p>}
//           </div>

//           {/* Photo Field */}
//           <div className="relative border-b border-base-300 pb-1">
//             <label className="text-xs opacity-70 font-semibold block">Photo</label>
//             <div className="flex items-center">
//               <FaImage className="mr-2 opacity-60" />
//               <input
//                 type="file"
//                 {...register("photo", { required: true })}
//                 className="bg-transparent outline-none w-full py-1 text-xs file:hidden cursor-pointer"
//               />
//             </div>
//             {errors.photo && <p className="text-error text-[10px] mt-1">Photo is required</p>}
//           </div>

//           {/* Email Field */}
//           <div className="relative border-b border-base-300 pb-1 focus-within:border-primary">
//             <label className="text-xs opacity-70 font-semibold block">Email</label>
//             <div className="flex items-center">
//               <FaEnvelope className="mr-2 opacity-60" />
//               <input
//                 type="email"
//                 {...register("email", { required: true })}
//                 className="bg-transparent outline-none w-full py-1 placeholder-base-content/50 dark:placeholder-white/50"
//                 placeholder="Email ID"
//               />
//             </div>
//             {errors.email && <p className="text-error text-[10px] mt-1">Email is required</p>}
//           </div>

//           {/* Password Field */}
//           <div className="relative border-b border-base-300 pb-1 focus-within:border-primary">
//             <label className="text-xs opacity-70 font-semibold block">Password</label>
//             <div className="flex items-center">
//               <FaLock className="mr-2 opacity-60" />
//               <input
//                 type="password"
//                 {...register("password", { required: true, minLength: 8 })}
//                 className="bg-transparent outline-none w-full py-1 placeholder-base-content/50 dark:placeholder-white/50"
//                 placeholder="Password"
//               />
//             </div>
//             {errors.password && <p className="text-error text-[10px] mt-1">Check password requirements</p>}
//           </div>

//           <button className="btn-primary w-full py-3 mt-4 font-bold tracking-widest uppercase shadow-lg">
//             Register
//           </button>
//         </form>

//         <p className="text-center text-sm mt-6 opacity-80">
//           Already have an account?{" "}
//           <Link to="/login" className="text-secondary font-bold hover:underline">
//             Login
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Register;