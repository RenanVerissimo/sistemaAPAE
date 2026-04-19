import { Routes, Route, Navigate } from "react-router-dom";
import { Login } from "@/app/components/Login";
import { SecretaryDashboard } from "@/app/components/pages/secretaria/SecretaryDashboard";
import { ProfessionalDashboard } from "@/app/components/pages/profissional/ProfessionalDashboard";
import { User } from "@/types";


interface AppRoutesProps {
  currentUser: User | null;
  handleLogin: (user: User) => void;
  handleLogout: () => void;
}

export function AppRoutes({
  currentUser,
  handleLogin,
  handleLogout,
}: AppRoutesProps) {
  return (
    <Routes>

      {/* Login */}
      <Route
        path="/login"
        element={
          !currentUser ? (
            <Login onLogin={handleLogin} />
          ) : currentUser.role === "secretaria" ? (
            <Navigate to="/SecretariaDashboard" />
          ) : (
            <Navigate to="/ProfissionalDashboard" />
          )
        }
      />

      {/* Secretaria */}
      <Route
        path="/SecretariaDashboard/*"
        element={
          currentUser?.role === "secretaria" ? (
            <SecretaryDashboard user={currentUser} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* Profissional */}
      <Route
        path="/ProfissionalDashboard/*"
        element={
          currentUser?.role === "profissional" ? (
            <ProfessionalDashboard user={currentUser} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* Default */}
      <Route path="*" element={<Navigate to="/login" />} />

    </Routes>
  );
}