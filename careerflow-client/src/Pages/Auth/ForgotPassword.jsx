import React, { useState } from "react";
import { useNavigate } from "react-router";
import { publicApi } from "../../Axios/axiosInstance";

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            const response = await publicApi.post("/auth/forgot-password", { email });
            if (response.data.success) {
                setSuccess("Password reset email sent. Opening Gmail in a new tab...");
                setTimeout(() => {
                    window.open("https://mail.google.com", "_blank");
                    navigate("/login");
                }, 2000);
            } else {
                setError(response.data.message || "Failed to send reset email.");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Network error. Please try again.");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-100 p-4">
            <div className="w-full max-w-md bg-base-200/50 backdrop-blur-xl rounded-2xl p-10 shadow-2xl border border-base-300">
                <h2 className="text-center text-2xl font-bold mb-6">Recover Password</h2>
                <p className="text-center text-sm opacity-60 mb-8">Enter your email and we'll send a recovery link</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="input input-bordered w-full"
                        required
                    />
                    <button type="submit" className="btn-primary w-full py-4 rounded-xl font-bold" disabled={loading}>
                        {loading ? <span className="loading loading-spinner loading-sm"></span> : "Send Reset Link"}
                    </button>
                    {error && <p className="text-error text-xs mt-2 text-center">{error}</p>}
                    {success && <p className="text-success text-md mt-2 text-center">{success}</p>}
                </form>
                <div className="mt-8 text-center">
                    <button onClick={() => navigate("/login")} className="text-sm hover:underline opacity-60">
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
