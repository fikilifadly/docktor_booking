import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage, AppointmentsPage } from "../pages";
import ProtectedRoute from "../components/ProtectedRoute";

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />
      <Route
        path="/login"
        element={<LoginPage />}
      />
      <Route
        path="/appointments"
        element={
          <ProtectedRoute>
            <AppointmentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={<div>404 Not Found</div>}
      />
    </Routes>
  );
}

export default AppRoutes;
