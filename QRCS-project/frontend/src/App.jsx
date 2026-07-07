import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import CitizenDashboard from "./pages/CitizenDashboard";
import ResponderDashboard from "./pages/ResponderDashboard";
import ReportIncident from "./pages/ReportIncident";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";

/* ─── Route guard ─── */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div
        style={{ paddingTop: '64px', minHeight: '100vh' }}
        className="flex items-center justify-center text-slate-400 text-sm"
      >
        Authenticating...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to the correct dashboard instead of blocking
    if (user.role === 'Admin') return <Navigate to="/admin" replace />;
    if (user.role === 'Responder') return <Navigate to="/responder" replace />;
    return <Navigate to="/citizen" replace />;
  }

  return children;
};

/* ─── Auth route (redirect if already logged in) ─── */
const AuthRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  if (user) {
    if (user.role === 'Admin') return <Navigate to="/admin" replace />;
    if (user.role === 'Responder') return <Navigate to="/responder" replace />;
    return <Navigate to="/citizen" replace />;
  }
  return children;
};

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
        <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
        <Route path="/forgot-password" element={<AuthRoute><ForgotPassword /></AuthRoute>} />
        <Route path="/reset-password/:token" element={<AuthRoute><ResetPassword /></AuthRoute>} />

        {/* Admin only */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* Citizen */}
        <Route path="/citizen" element={
          <ProtectedRoute allowedRoles={['Citizen', 'Admin']}>
            <CitizenDashboard />
          </ProtectedRoute>
        } />

        {/* Responder */}
        <Route path="/responder" element={
          <ProtectedRoute allowedRoles={['Responder', 'Admin']}>
            <ResponderDashboard />
          </ProtectedRoute>
        } />

        {/* Report — all authenticated users */}
        <Route path="/report" element={
          <ProtectedRoute>
            <ReportIncident />
          </ProtectedRoute>
        } />

        {/* Profile — all authenticated users */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;