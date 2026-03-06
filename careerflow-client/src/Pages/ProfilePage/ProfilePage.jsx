  import React, { useState, useRef } from "react"; // ⚠️ Added useRef
  import { useSelector, useDispatch } from "react-redux";
  import { fetchMe, logout } from "../../Redux/auth/authSlice";
  import {
    FaUserEdit,
    FaEnvelope,
    FaBriefcase,
    FaCrown,
    FaSignOutAlt,
    FaCamera,
    FaRocketchat,
    FaCheckCircle,
    FaLock,
    FaShieldAlt,
    FaSave,
    FaTimes,
    FaSpinner, // ⚠️ Added for loading state
  } from "react-icons/fa";
  import { useNavigate } from "react-router";
  import { AnimatePresence, motion } from "framer-motion";
  import { privateApi } from "../../Axios/axiosInstance";
  import { toast } from "react-toastify";
  import axios from "axios"; // ⚠️ Added for the external ImgBB request

  const ProfilePage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    // Reference for the hidden file input
    const fileInputRef = useRef(null);
    
    // Security State
    const [newPassword, setNewPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Editing States
    const [isUpdating, setIsUpdating] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false); //  
    const [displayImage, setDisplayImage] = useState(user?.imageUrl || "https://via.placeholder.com/150");
    const [isEditingPersonal, setIsEditingPersonal] = useState(false);
    const [editName, setEditName] = useState("");
    
    const [isEditingIndustries, setIsEditingIndustries] = useState(false);
    const [editIndustriesRaw, setEditIndustriesRaw] = useState("");

    const isStarter = user?.plan?.toLowerCase() === "starter";
    const isGoogleUser = user?.authProvider === "google";

    const handleLogout = () => {
      dispatch(logout());
      navigate("/login");
    };
    React.useEffect(() => {
      if (user?.imageUrl) setDisplayImage(user.imageUrl);
    }, [user?.imageUrl]);
    const handleSetPassword = async (e) => {
      e.preventDefault();
      if (newPassword.length < 6)
        return toast.error("Password must be at least 6 characters");

      setIsSubmitting(true);
      try {
        const response = await privateApi.post("/auth/set-password", {
          newPassword,
        });

        if (response.data.success) {
          toast.success("Password set! Your account is now fully secured.");
          setNewPassword("");
          dispatch(fetchMe());
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to set password");
      } finally {
        setIsSubmitting(false);
      }
    };

    // Generic Update Handler
    const handleUpdate = async (payload, onSuccess) => {
      setIsUpdating(true);
      try {
        const response = await privateApi.patch("/auth/update-me", payload);
        
        if (response.data.success) {
          toast.success("Profile updated successfully!");
          dispatch(fetchMe());
          if (onSuccess) onSuccess();
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to update profile");
      } finally {
        setIsUpdating(false);
      }
    };

    // ==========================================
    // ⚠️ NEW: IMAGE UPLOAD LOGIC
    // ==========================================
    const handleImageClick = () => {
      fileInputRef.current.click();
    };

    const handleImageUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Optional: Check file type/size before uploading
      if (file.size > 5 * 1024 * 1024) {
        return toast.error("Image must be smaller than 5MB");
      }

      setIsUploadingImage(true);
      const formData = new FormData();
      formData.append("image", file);

      try {
        // 1. Upload to ImgBB
        const imgbbKey = import.meta.env.VITE_IMGBB_API_KEY;
        const imgbbRes = await axios.post(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, formData);
        
        const newImageUrl = imgbbRes.data.data.url;
        setDisplayImage(newImageUrl);
        // 2. Update Backend Database
        await handleUpdate({ imageUrl: newImageUrl });
        
      } catch (error) {
        console.error("Image Upload Error:", error);
        toast.error("Failed to upload image. Please try again.");
      } finally {
        setIsUploadingImage(false);
        // Reset input so the same file can be selected again if needed
        e.target.value = ""; 
      }
    };
    // ==========================================

    // Personal Info Handlers
    const togglePersonalEdit = () => {
      if (!isEditingPersonal) setEditName(user.name);
      setIsEditingPersonal(!isEditingPersonal);
    };

    const savePersonalInfo = () => {
      if (!editName.trim()) return toast.error("Name cannot be empty");
      handleUpdate({ name: editName }, () => setIsEditingPersonal(false));
    };

    // Industry Handlers
    const toggleIndustryEdit = () => {
      if (!isEditingIndustries) {
        setEditIndustriesRaw(user.industries?.join(", ") || "");
      }
      setIsEditingIndustries(!isEditingIndustries);
    };

    const saveIndustries = () => {
      const industriesArray = editIndustriesRaw
        .split(",")
        .map((ind) => ind.trim())
        .filter((ind) => ind.length > 0);
        
      handleUpdate({ industries: industriesArray }, () => setIsEditingIndustries(false));
    };

    if (!user) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      );
    }

    const containerVariants = {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
    };

    const itemVariants = {
      hidden: { y: 20, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.5, ease: "easeOut" },
      },
    };

    return (
      <div className="relative w-full overflow-hidden min-h-full p-10">
        <motion.div
          animate={{ x: [0, 50, -200, 0], y: [0, 30, 500, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-24 -left-20 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none z-0"
        />
        <motion.div
          animate={{ x: [0, -60, 200, 0], y: [0, -40, -200, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 -right-20 w-[450px] h-[450px] bg-secondary/20 rounded-full blur-[100px] pointer-events-none z-0"
        />

        <div className="relative z-10 max-w-6xl mx-auto space-y-8 px-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-3xl md:text-4xl font-extrabold text-base-content tracking-tight">
              My Profile
            </h1>
            <p className="text-base-content/60 mt-2 text-sm md:text-base font-medium">
              Manage your CareerFlow account details.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Left Column */}
            <div className="col-span-1 space-y-8">
              <motion.div variants={itemVariants}>
                <div className="bg-base-100/60 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-base-300/50 overflow-hidden relative group">
                  <div className="h-32 bg-gradient-to-r from-primary/80 to-secondary/80 w-full relative"></div>
                  <div className="px-8 pb-8 pt-0 flex flex-col items-center text-center -mt-16">
                    <div className="relative mb-4">
                      <div className="avatar">
                        <div className={`w-32 h-32 rounded-full ring-4 ring-base-100 bg-base-200 shadow-xl overflow-hidden ${isUploadingImage ? 'opacity-50' : ''}`}>
                          <img
                            // src={
                            //   user.imageUrl || "https://via.placeholder.com/150"
                            // }
                            src={displayImage}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          {/* ⚠️ Loading Spinner overlay for image */}
                          {isUploadingImage && (
                            <div className="absolute inset-0 flex items-center justify-center bg-base-100/50">
                              <FaSpinner className="animate-spin text-primary" size={24} />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* ⚠️ Hidden file input */}
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageUpload} 
                        accept="image/png, image/jpeg, image/jpg" 
                        className="hidden" 
                      />
                      
                      <button 
                        onClick={handleImageClick}
                        disabled={isUploadingImage}
                        className="absolute bottom-1 right-1 bg-primary text-primary-content p-2.5 rounded-full shadow-lg border-2 border-base-100 hover:scale-110 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                      >
                        <FaCamera size={14} />
                      </button>
                    </div>
                    <h2 className="text-2xl font-bold">{user.name}</h2>
                    <p className="text-sm opacity-60 mb-5">{user.email}</p>
                    <div className="badge badge-primary bg-primary/10 text-primary border-primary/20 gap-2 px-4 py-3 font-bold uppercase tracking-widest text-xs">
                      <FaCrown size={12} /> {user.plan} Plan
                    </div>
                    <div className="divider w-full my-6 opacity-50"></div>
                    <button
                      onClick={handleLogout}
                      className="btn btn-error btn-outline w-full rounded-xl gap-2"
                    >
                      <FaSignOutAlt /> Secure Log Out
                    </button>
                  </div>
                </div>
              </motion.div>

              {isStarter && (
                <motion.div
                  variants={itemVariants}
                  className="bg-gradient-to-br from-secondary to-primary p-[1.5px] rounded-[2.5rem] shadow-2xl overflow-hidden"
                >
                  <div className="bg-base-100/90 backdrop-blur-3xl rounded-[2.4rem] p-8 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-secondary/10 rounded-2xl text-secondary animate-pulse">
                        <FaRocketchat size={24} />
                      </div>
                      <h3 className="font-bold text-xl tracking-tight">
                        Unlock Pro
                      </h3>
                    </div>
                    <p className="text-sm text-base-content/70 mb-6 leading-relaxed">
                      Unlock unlimited Kanban boards and AI matching.
                    </p>
                    <button
                      onClick={() => navigate("/upgrade")}
                      className="btn btn-secondary w-full rounded-2xl font-bold"
                    >
                      Upgrade Now
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right Column */}
            <div className="col-span-1 lg:col-span-2 space-y-8">
              {/* Account Info */}
              <motion.div
                variants={itemVariants}
                className="bg-base-100/60 backdrop-blur-2xl rounded-[2rem] p-8 shadow-2xl border border-base-300/50"
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <FaUserEdit size={20} />
                    </div>
                    Personal Info
                  </h3>
                  
                  {/* Dynamic Edit/Cancel Button */}
                  {!isEditingPersonal ? (
                    <button onClick={togglePersonalEdit} className="btn btn-ghost btn-sm text-primary">
                      Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={togglePersonalEdit} className="btn btn-ghost btn-sm text-base-content/50">
                        <FaTimes /> Cancel
                      </button>
                      <button 
                        onClick={savePersonalInfo} 
                        disabled={isUpdating}
                        className="btn btn-primary btn-sm gap-2"
                      >
                        {isUpdating ? <span className="loading loading-spinner loading-xs"></span> : <FaSave />} Save
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="text-[10px] font-bold opacity-50 uppercase tracking-widest block mb-1">
                      Full Name
                    </label>
                    {!isEditingPersonal ? (
                      <p className="text-lg font-semibold">{user.name}</p>
                    ) : (
                      <input 
                        type="text" 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="input input-bordered w-full bg-base-200/50 focus:outline-primary transition-all"
                      />
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] font-bold opacity-50 uppercase tracking-widest block mb-1">
                      Email Address
                    </label>
                    <p className="text-lg font-semibold">{user.email}</p>
                    {isEditingPersonal && (
                      <p className="text-xs text-base-content/50 mt-1">Email cannot be changed.</p>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Security Section (Only for Google Users) */}
              <AnimatePresence mode="popLayout">
                {isGoogleUser && (
                  <motion.div
                    key="security-card"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{
                      opacity: 0,
                      scale: 0.95,
                      y: -20,
                      transition: { duration: 0.4, ease: "easeInOut" },
                    }}
                    layout
                    className="bg-base-100/60 backdrop-blur-2xl rounded-[2rem] p-8 shadow-2xl border border-base-300/50 relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                      <FaShieldAlt size={80} />
                    </div>
                    <h3 className="text-xl font-bold flex items-center gap-3 mb-4">
                      <div className="p-2 bg-warning/10 rounded-lg text-warning">
                        <FaLock size={20} />
                      </div>
                      Account Security
                    </h3>
                    <p className="text-sm text-base-content/60 mb-6 max-w-md">
                      You are logged in via Google. Set a password to enable
                      direct email login in the future.
                    </p>

                    <form
                      onSubmit={handleSetPassword}
                      className="flex flex-col md:flex-row gap-4"
                    >
                      <input
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="input input-bordered bg-base-200/50 rounded-xl flex-1 focus:outline-primary transition-all"
                        required
                      />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn btn-primary rounded-xl px-8 shadow-lg shadow-primary/20 disabled:opacity-50"
                      >
                        {isSubmitting ? "Setting..." : "Set Password"}
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Target Industries */}
              <motion.div
                variants={itemVariants}
                layout
                className="bg-base-100/60 backdrop-blur-2xl rounded-[2rem] p-8 shadow-2xl border border-base-300/50"
              >
                <h3 className="text-xl font-bold flex items-center gap-3 mb-6">
                  <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
                    <FaBriefcase size={20} />
                  </div>
                  Target Industries
                </h3>
                
                {!isEditingIndustries ? (
                  <>
                    <div className="flex flex-wrap gap-3">
                      {user.industries?.length > 0 ? (
                        user.industries.map((ind, i) => (
                          <span
                            key={i}
                            className="px-4 py-2 bg-base-200/50 border border-base-300 rounded-xl text-sm font-semibold"
                          >
                            {ind}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-base-content/50 italic">No industries specified yet.</span>
                      )}
                    </div>
                    <div className="mt-8 pt-6 border-t border-base-300/50">
                      <button onClick={toggleIndustryEdit} className="btn btn-primary rounded-xl px-8 font-bold">
                        Update Preferences
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <input 
                        type="text" 
                        value={editIndustriesRaw}
                        onChange={(e) => setEditIndustriesRaw(e.target.value)}
                        placeholder="e.g. Technology, Finance, Healthcare"
                        className="input input-bordered w-full bg-base-200/50 focus:outline-primary transition-all"
                      />
                      <p className="text-xs text-base-content/50 mt-2 font-medium">
                        Separate multiple industries with commas.
                      </p>
                    </div>
                    <div className="mt-8 pt-6 border-t border-base-300/50 flex gap-4">
                      <button 
                        onClick={saveIndustries} 
                        disabled={isUpdating}
                        className="btn btn-primary rounded-xl px-8 font-bold gap-2"
                      >
                        {isUpdating ? <span className="loading loading-spinner loading-xs"></span> : <FaSave />} Save Changes
                      </button>
                      <button onClick={toggleIndustryEdit} className="btn btn-ghost rounded-xl px-8 font-bold text-base-content/60">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  };

  export default ProfilePage;
  