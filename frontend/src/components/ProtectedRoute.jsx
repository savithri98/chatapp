import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

/**
 * Wraps a route and redirects to /login if the user is not authenticated.
 */
const ProtectedRoute = ({ children }) => {
    const { user } = useAuthStore();
    return user ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
