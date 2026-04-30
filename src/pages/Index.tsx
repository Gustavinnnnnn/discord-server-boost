import { Navigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user, loading } = useAuth();
  const [params] = useSearchParams();

  // Captura código de afiliado e guarda pra usar depois do signup
  useEffect(() => {
    const ref = params.get("ref");
    if (ref) {
      try {
        localStorage.setItem("aff_ref", ref);
        // tracking de clique (sem auth)
        fetch(`https://srwdikhfrfdmhlfdklzj.supabase.co/functions/v1/track-referral`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: ref, action: "click" }),
        }).catch(() => {});
      } catch { /* ignore */ }
    }
  }, [params]);

  if (loading) return <div className="min-h-screen grid place-items-center bg-background"><div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>;
  return <Navigate to={user ? "/app" : "/auth"} replace />;
};

export default Index;
