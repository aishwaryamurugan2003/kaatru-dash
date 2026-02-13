import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiService } from "../services/api";
import React from "react";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const loggedIn = await apiService.isLoggedIn();
      setAllowed(loggedIn);
    };
    checkAuth();
  }, []);

  if (allowed === null) {
    return <div className="p-6">Checking authentication...</div>;
  }

  if (!allowed) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
