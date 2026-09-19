import { Navigate, useLocation } from "react-router-dom";

function CheckAuth({ isAuthenticated, user, children }) {
  const location = useLocation();

  const path = location.pathname;

  // =========================
  // NOT LOGGED IN
  // =========================
  if (!isAuthenticated) {

    // Auth pages are allowed
    if (path.startsWith("/auth")) {
      return children;
    }

    // Admin pages require login
    if (path.startsWith("/admin")) {
      return <Navigate to="/auth/login" replace />;
    }

    // Shop pages require login
    if (path.startsWith("/shop")) {
      return <Navigate to="/auth/login" replace />;
    }

    // Other pages
    return children;
  }


  // =========================
  // LOGGED IN USER
  // =========================

  // Admin trying to access auth pages
  if (path.startsWith("/auth")) {
    if (user?.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }

    return <Navigate to="/shop/home" replace />;
  }


  // Normal user trying to access admin
  if (path.startsWith("/admin") && user?.role !== "admin") {
    return <Navigate to="/unauth-page" replace />;
  }


  // Admin trying to access shop
  if (path.startsWith("/shop") && user?.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }


  return children;
}

export default CheckAuth;