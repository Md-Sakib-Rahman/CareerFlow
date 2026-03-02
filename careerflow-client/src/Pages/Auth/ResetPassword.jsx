import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { publicApi } from "../../Axios/axiosInstance";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Extract token from query string
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get("token");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        // Password Validation Logic
        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }
        if (!/[A-Z]/.test(password)) {
            setError("Password must contain at least one uppercase letter.");
            return;
        }
        if (!/[a-z]/.test(password)) {
            setError("Password must contain at least one lowercase letter.");
            return;
        }
        if (!/[0-9]/.test(password)) {
            setError("Password must contain at least one number.");
            return;
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            setError("Password must contain at least one special character.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        setLoading(true);
        try {
            const response = await publicApi.patch(`/auth/reset-password/${token}`, { password });
            if (response.data.success) {
                setSuccess("Password reset successful! Redirecting to login...");
                setTimeout(() => navigate("/login"), 2000);
            } else {
                setError(response.data.message || "Failed to reset password.");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Network error. Please try again.");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-100 p-4">
            <div className="w-full max-w-md bg-base-200/50 backdrop-blur-xl rounded-2xl p-10 shadow-2xl border border-base-300">
                <h1 className="text-center text-2xl font-bold mb-6">Reset Password</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="New Password"
                            className="input input-bordered w-full pr-10"
                            required
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            placeholder="Confirm New Password"
                            className="input input-bordered w-full pr-10"
                            required
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    <button type="submit" className="btn-primary py-4 w-full" disabled={loading}>
                        {loading ? <span className="loading loading-spinner loading-sm"></span> : "Reset Password"}
                    </button>
                    {error && <p className="text-error text-xs mt-2">{error}</p>}
                    {success && <p className="text-success text-xs mt-2">{success}</p>}
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
