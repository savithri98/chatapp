import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

import { GoogleLogin } from "@react-oauth/google";

const Signup = () => {
    const navigate = useNavigate();
    const { register, googleLogin, isLoading } = useAuthStore();
    const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });

    const handleChange = (e) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirm) {
            return toast.error("Passwords do not match");
        }
        if (form.password.length < 6) {
            return toast.error("Password must be at least 6 characters");
        }
        const result = await register(form.name, form.email, form.password);
        if (result.success) {
            toast.success("Account created! Welcome 🎉");
            navigate("/");
        } else {
            toast.error(result.message);
        }
    };

    const handleGoogleSuccess = async (response) => {
        const result = await googleLogin(response.credential);
        if (result.success) {
            toast.success("Welcome! Account created successfully 🎉");
            navigate("/");
        } else {
            toast.error(result.message);
        }
    };

    return (
        <div className="min-h-screen bg-dark-300 flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-primary-600/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-primary-500/8 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative z-10 animate-fade-in">
                <div className="bg-dark-200 rounded-2xl shadow-2xl border border-white/5 p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600 mb-4 shadow-lg">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-white">Create account</h1>
                        <p className="text-gray-400 mt-1 text-sm">Join ChatApp today</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="John Doe"
                                required
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                required
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Min. 6 characters"
                                required
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm Password</label>
                            <input
                                type="password"
                                name="confirm"
                                value={form.confirm}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                                className="input-field"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full mt-2 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Creating account...
                                </>
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-dark-200 px-2 text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    {/* Google Login Button */}
                    <div className="flex justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => toast.error("Google Login Failed")}
                            theme="filled_black"
                            shape="pill"
                        />
                    </div>

                    <p className="text-center text-sm text-gray-400 mt-6">
                        Already have an account?{" "}
                        <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
