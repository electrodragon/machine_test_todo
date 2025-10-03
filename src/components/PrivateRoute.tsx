import { Navigate } from "react-router-dom";

type PrivateRouteProps = {
  children: JSX.Element;
  allowedRoles?: string[];
  isAuthRoute?: boolean
};

export const PrivateRoute = ({ children, allowedRoles, isAuthRoute }: PrivateRouteProps) => {
  const storedUser = localStorage.getItem("currentUser");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const isUserLoggedIn = () => !!user && user.role === "user";
  const isAdminLoggedIn = () => !!user && user.role === "admin";

  if (isAuthRoute) {
    if (isUserLoggedIn()) {
      return <Navigate to="/" replace />;
    }

    if (isAdminLoggedIn()) {
      return <Navigate to="/admin-dashboard" replace />;
    }

    return children;
  }

  if (allowedRoles) {
    if (allowedRoles.includes("user")) {
      if (isUserLoggedIn()) {
        return children;
      }

      return <Navigate to="/login" replace />;
    }

    if (allowedRoles.includes("admin")) {
      if (isAdminLoggedIn()) {
        return children;
      }

      return <Navigate to="/login" replace />;
    }
  }

  return children;
};
