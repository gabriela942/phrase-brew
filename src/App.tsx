import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { GtmPageviewTracker } from "./components/GtmPageviewTracker";
import { DiscoveryLayout } from "./layouts/DiscoveryLayout";
import { TemplateDetailLayout } from "./layouts/TemplateDetailLayout";
import { AdminLayout } from "./layouts/AdminLayout";
import Index from "./pages/Index";
import TemplateDetail from "./pages/TemplateDetail";
import SubmitTemplate from "./pages/SubmitTemplate";
import AdminApproved from "./pages/AdminApproved";
import AdminRejected from "./pages/AdminRejected";
import AdminArchived from "./pages/AdminArchived";
import AdminReview from "./pages/AdminReview";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <GtmPageviewTracker />
        <AuthProvider>
          <Routes>
            {/* Public discovery shell — full filters, hero, contribution CTA */}
            <Route element={<DiscoveryLayout />}>
              <Route path="/" element={<Index />} />
            </Route>

            {/* Detail / secondary content shell — minimal logo + Voltar */}
            <Route element={<TemplateDetailLayout />}>
              <Route path="/template/:id" element={<TemplateDetail />} />
              <Route path="/submit" element={<SubmitTemplate />} />
            </Route>

            {/* Admin shell — operations header + auth gate */}
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<Navigate to="/admin/approved" replace />} />
              <Route path="/admin/approved" element={<AdminApproved />} />
              <Route path="/admin/rejected" element={<AdminRejected />} />
              <Route path="/admin/archived" element={<AdminArchived />} />
              <Route path="/admin/review/:id" element={<AdminReview />} />
            </Route>

            {/* Standalone (no layout) */}
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
