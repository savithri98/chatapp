import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { SocketProvider } from "./context/SocketContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { useAuthStore } from "./store/authStore";

import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = "1021599630602-aivq277aionq9rit0u92iq296ejh0epq.apps.googleusercontent.com";

function App() {
  const { user } = useAuthStore();

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        {/* Socket.IO connection — only active when user is authenticated */}
        <SocketProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#1e2a35",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
              },
              success: { iconTheme: { primary: "#22c55e", secondary: "#fff" } },
              error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
            }}
          />

          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/login"
              element={user ? <Navigate to="/" replace /> : <Login />}
            />
            <Route
              path="/signup"
              element={user ? <Navigate to="/" replace /> : <Signup />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
