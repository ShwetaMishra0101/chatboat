import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import Chat from "./pages/Chat.tsx";
import OAuthCallback from "./pages/OAuthCallback.tsx";
import { getUser } from "./api.ts";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return getUser() ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/oauth" element={<OAuthCallback />} />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
