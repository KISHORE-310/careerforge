import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { getCurrentUser } from "../services/api";

function ProtectedRoute() {
  const location = useLocation();
  const [state, setState] = useState(() => (localStorage.getItem("token") ? "checking" : "signed-out"));

  useEffect(() => {
    let active = true;
    const verifySession = async () => {
      const result = await getCurrentUser();
      if (!active) return;
      if (result.success && result.user) {
        localStorage.setItem("user", JSON.stringify(result.user));
        setState("signed-in");
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setState("signed-out");
      }
    };
    verifySession();
    return () => { active = false; };
  }, []);

  if (state === "checking") {
    return <main className="grid min-h-screen place-items-center bg-[#0b0b0b] text-sm text-stone-400">Restoring your secure session…</main>;
  }
  if (state === "signed-out") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}

export default ProtectedRoute;
