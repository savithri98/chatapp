import { useState, useRef } from "react";
import { useAuthStore } from "../store/authStore";
import Avatar from "./Avatar";
import toast from "react-hot-toast";

/**
 * ProfileModal — Allows users to change their name and profile picture.
 */
const ProfileModal = ({ onClose }) => {
    const { user, updateProfile } = useAuthStore();
    const [name, setName] = useState(user?.name || "");
    const [isUpdating, setIsUpdating] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const fileRef = useRef(null);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            await updateProfile({ name, avatar: avatarFile });
            toast.success("Profile updated!");
            onClose();
        } catch (error) {
            toast.error("Failed to update profile");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-dark-200 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-white/5 animate-scale-in">
                {/* Header */}
                <div className="bg-dark-100 p-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Profile</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSave} className="p-8 space-y-8">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center">
                        <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary-500/20 group-hover:border-primary-500 transition-all duration-300">
                                {avatarPreview ? (
                                    <img src={avatarPreview} className="w-full h-full object-cover" alt="Preview" />
                                ) : (
                                    <Avatar user={user} size="full" />
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                        </div>
                        <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                        <p className="mt-4 text-xs text-gray-500">Tap to change profile picture</p>
                    </div>

                    {/* Name Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Your Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Type your name"
                            className="w-full bg-dark-100 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary-600 transition-all"
                            required
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isUpdating}
                            className="flex-[2] px-6 py-3 rounded-xl bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 transition-all font-medium flex items-center justify-center gap-2"
                        >
                            {isUpdating ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileModal;
