import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AdminHeader } from "@/components/AdminHeader";

// ─── AdminLayout ──────────────────────────────────────────────────────────────
// Operations-focused shell for /admin routes. Embeds the auth guard so child
// routes don't need to wrap themselves in <ProtectedRoute>.

export function AdminLayout() {
  const { session, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Carregando...</div>
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <Outlet />
    </div>
  );
}
