import React, { useState } from "react";
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
} from "react-icons/fa";
import { useNavigate } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { privateApi } from "../../Axios/axiosInstance";
import { toast } from "react-toastify";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isStarter = user?.plan?.toLowerCase() === "starter";
  const isGoogleUser = user?.authProvider === "google"; // Check if user logged in via Google

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

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

        // 2. CRITICAL: Re-fetch user data to update Redux state
        // This will change user.authProvider to "both" and hide the section!
        dispatch(fetchMe());
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to set password");
    } finally {
      setIsSubmitting(false);
    }
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
      {/* Animated Ambient Blurs */}
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
                      <div className="w-32 h-32 rounded-full ring-4 ring-base-100 bg-base-200 shadow-xl overflow-hidden">
                        <img 
                          src={user.imageUrl || "https://via.placeholder.com/150"
                          }
                          alt="Avatar"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                    <button className="absolute bottom-1 right-1 bg-primary text-primary-content p-2.5 rounded-full shadow-lg border-2 border-base-100 hover:scale-110 transition-transform">
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
                 <button className="btn btn-ghost btn-sm text-primary">
                  Edit
                </button>
              </div>
             <div className="flex justify-between gap-10">
  
                <div className="space-y-2">
                  <label className="text-[10px] font-bold opacity-50 uppercase tracking-widest">
                    Full Name
                  </label>
                  <p className="text-lg font-semibold">{user.name}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold opacity-50 uppercase tracking-widest">
                    Email
                  </label>
                  <p className="text-lg font-semibold">{user.email}</p>
                </div>

            </div>
            </motion.div>

            {/* NEW: Security Section (Only for Google Users) */}
            <AnimatePresence mode="popLayout">
              {isGoogleUser && (
                <motion.div
                  key="security-card" // Unique key is required for exit animations
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{
                    opacity: 0,
                    scale: 0.95,
                    y: -20,
                    transition: { duration: 0.4, ease: "easeInOut" },
                  }}
                  layout // This makes surrounding cards slide smoothly into the empty space
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
              <div className="flex flex-wrap gap-3">
                {user.industries?.map((ind, i) => (
                  <span
                    key={i}
                    className="px-4 py-2 bg-base-200/50 border border-base-300 rounded-xl text-sm font-semibold"
                  >
                    {ind}
                  </span>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-base-300/50">
                <button className="btn btn-primary rounded-xl px-8 font-bold">
                  Update Preferences
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
