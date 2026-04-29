import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen grid place-items-center bg-background"><div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>;
  return <Navigate to={user ? "/app" : "/auth"} replace />;
};

export default Index;
