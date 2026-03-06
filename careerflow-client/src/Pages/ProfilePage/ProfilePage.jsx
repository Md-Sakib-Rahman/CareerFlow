import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchMe, logout } from "../../Redux/auth/authSlice";
import {
  FaUserEdit,
  FaBriefcase,
  FaCrown,
  FaSignOutAlt,
  FaCamera,
  FaRocketchat,
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

  const [editMode, setEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [imageUrl, setImageUrl] = useState(user?.imageUrl || "");
  const [newPassword, setNewPassword] = useState("");

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const isStarter = user?.plan?.toLowerCase() === "starter";
  const isGoogleUser = user?.authProvider === "google";

  // 🔹 Sync local state with Redux user whenever it updates
  useEffect(() => {
    setName(user?.name || "");
    setEmail(user?.email || "");
    setImageUrl(user?.imageUrl || "");
    setImagePreview(null);
  }, [user]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

 const handleUpdateProfile = async () => {
  try {
    setIsSubmitting(true);

    const res = await privateApi.patch("/auth/update-me", {
      name,
      email,
      imageUrl,
    });

    if (res.data.success) {
      toast.success("Profile updated successfully");

      dispatch(fetchMe()); // refresh redux user
      setEditMode(false);
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "Update failed");
  } finally {
    setIsSubmitting(false);
  }
};

  const handleSetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    try {
      setIsSubmitting(true);
      const res = await privateApi.post("/auth/set-password", { newPassword });
      if (res.data.success) {
        toast.success("Password set successfully");
        setNewPassword("");
        dispatch(fetchMe());
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error setting password");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden min-h-full p-10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT PROFILE CARD */}
        <div className="space-y-8">
          <div className="bg-base-100 rounded-[2rem] shadow-xl overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-primary to-secondary"></div>

            <div className="px-8 pb-8 flex flex-col items-center -mt-16">
              <div className="avatar mb-4 relative">
                <div className="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden">
                  <img
                    src={imagePreview || user.imageUrl || "https://via.placeholder.com/150"}
                    alt="avatar"
                    className="object-cover w-full h-full"
                  />
                </div>

                {/* Hidden file input */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="profileImageInput"
                />

                {/* Camera Button */}
                <label
                  htmlFor="profileImageInput"
                  className="absolute bottom-1 right-1 bg-primary text-white p-2 rounded-full cursor-pointer hover:scale-110 transition"
                >
                  <FaCamera size={14} />
                </label>
              </div>

              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="opacity-60">{user.email}</p>

              <div className="badge badge-primary mt-3 gap-2">
                <FaCrown size={12} /> {user.plan} Plan
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-error btn-outline w-full mt-6"
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>

          {isStarter && (
            <div className="bg-gradient-to-br from-secondary to-primary p-[1px] rounded-[2rem]">
              <div className="bg-base-100 p-6 rounded-[2rem]">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <FaRocketchat /> Upgrade Plan
                </h3>
                <p className="text-sm opacity-70 mt-2">
                  Unlock unlimited boards and AI matching.
                </p>
                <button
                  onClick={() => navigate("/upgrade")}
                  className="btn btn-secondary w-full mt-4"
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="lg:col-span-2 space-y-8">
          {/* PERSONAL INFO */}
          <div className="bg-base-100 rounded-[2rem] p-8 shadow-xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FaUserEdit /> Personal Info
              </h3>

              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="btn btn-ghost btn-sm text-primary"
                >
                  Edit
                </button>
              )}
            </div>

            <div className="flex justify-between gap-10">
              {/* NAME */}
              <div className="space-y-2 w-full">
                <label className="text-[10px] font-bold opacity-50 uppercase tracking-widest">
                  Full Name
                </label>
                {editMode ? (
                  <input
                    className="input input-bordered w-full"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                ) : (
                  <p className="text-lg font-semibold">{user.name}</p>
                )}
              </div>

              {/* EMAIL */}
              <div className="space-y-2 w-full">
                <label className="text-[10px] font-bold opacity-50 uppercase tracking-widest">
                  Email
                </label>
                {editMode ? (
                  <input
                    className="input input-bordered w-full"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                ) : (
                  <p className="text-lg font-semibold">{user.email}</p>
                )}
              </div>
            </div>

            {/* SAVE CANCEL */}
            {editMode && (
              <div className="flex gap-4 mt-8">
                <button
                  onClick={handleUpdateProfile}
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => {
                    setEditMode(false);
                    setName(user.name);
                    setEmail(user.email);
                    setImageUrl(user.imageUrl || "");
                    setImagePreview(null);
                  }}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* GOOGLE SECURITY */}
          <AnimatePresence>
            {isGoogleUser && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-base-100 rounded-[2rem] p-8 shadow-xl"
              >
                <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
                  <FaShieldAlt /> Account Security
                </h3>

                <p className="text-sm opacity-70 mb-4">
                  You logged in with Google. Set password for email login.
                </p>

                <form onSubmit={handleSetPassword} className="flex gap-4">
                  <input
                    type="password"
                    placeholder="New password"
                    className="input input-bordered w-full"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button className="btn btn-primary" disabled={isSubmitting}>
                    Set Password
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* INDUSTRIES */}
          <div className="bg-base-100 rounded-[2rem] p-8 shadow-xl">
            <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
              <FaBriefcase /> Target Industries
            </h3>
            <div className="flex flex-wrap gap-3">
              {user.industries?.map((ind, i) => (
                <span key={i} className="badge badge-outline p-3">
                  {ind}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;