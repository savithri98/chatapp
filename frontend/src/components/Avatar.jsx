/**
 * Avatar component — shows user's avatar image or a colored initial fallback.
 */
const Avatar = ({ user, size = "md", showStatus = false }) => {
    const sizes = {
        sm: "w-8 h-8 text-xs",
        md: "w-10 h-10 text-sm",
        lg: "w-12 h-12 text-base",
        xl: "w-16 h-16 text-xl",
    };

    const initials = user?.name
        ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : "?";

    // Generate a consistent color from the user's name
    const colors = [
        "bg-violet-600", "bg-blue-600", "bg-teal-600",
        "bg-orange-600", "bg-rose-600", "bg-indigo-600",
    ];
    const colorIndex = user?.name
        ? user.name.charCodeAt(0) % colors.length
        : 0;

    return (
        <div className="relative flex-shrink-0">
            {user?.avatar ? (
                <img
                    src={user.avatar}
                    alt={user.name}
                    className={`${sizes[size]} rounded-full object-cover`}
                />
            ) : (
                <div
                    className={`${sizes[size]} ${colors[colorIndex]} rounded-full flex items-center justify-center font-semibold text-white`}
                >
                    {initials}
                </div>
            )}

            {/* Online status dot */}
            {showStatus && (
                <span
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-dark-200 ${user?.isOnline ? "bg-primary-500" : "bg-gray-500"
                        }`}
                />
            )}
        </div>
    );
};

export default Avatar;
