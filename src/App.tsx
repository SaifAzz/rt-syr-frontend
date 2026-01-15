import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Jobs from "./pages/Jobs";
import Tenders from "./pages/Tenders";
import About from "./pages/About";
import Pricing from "./pages/Pricing";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";
import UserDashboard from "./pages/dashboards/UserDashboard";
import CompanyDashboard from "./pages/dashboards/CompanyDashboard";
import OrganizationDashboard from "./pages/dashboards/OrganizationDashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import PostTender from "./pages/PostTender";
import PostJob from "./pages/PostJob";
import JobDetails from "./pages/JobDetails";
import TenderDetails from "./pages/TenderDetails";
import CreateAdmin from "./pages/CreateAdmin";
import NotFound from "./pages/NotFound";
import "./lib/i18n";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route
                path="/jobs/:id"
                element={
                  <ProtectedRoute requireAuth={true} requireEmailVerification={true}>
                    <JobDetails />
                  </ProtectedRoute>
                }
              />
              <Route path="/tenders" element={<Tenders />} />
              <Route
                path="/tenders/:id"
                element={
                  <ProtectedRoute requireAuth={true} requireEmailVerification={true}>
                    <TenderDetails />
                  </ProtectedRoute>
                }
              />
              <Route path="/about" element={<About />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin/dashboard/login" element={<AdminLogin />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/verify-email"
                element={
                  <ProtectedRoute requireAuth={false} requireEmailVerification={false}>
                    <VerifyEmail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requireAuth={true} requireEmailVerification={true}>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/company"
                element={
                  <ProtectedRoute
                    requireAuth={true}
                    requireEmailVerification={true}
                    allowedUserTypes={['company']}
                  >
                    <CompanyDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/organization"
                element={
                  <ProtectedRoute
                    requireAuth={true}
                    requireEmailVerification={true}
                    allowedUserTypes={['organization']}
                  >
                    <OrganizationDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/admin"
                element={
                  <ProtectedRoute
                    requireAuth={true}
                    requireEmailVerification={true}
                    allowedUserTypes={['admin']}
                  >
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tenders/post"
                element={
                  <ProtectedRoute
                    requireAuth={true}
                    requireEmailVerification={true}
                    allowedUserTypes={['company', 'organization', 'admin']}
                  >
                    <PostTender />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/jobs/post"
                element={
                  <ProtectedRoute
                    requireAuth={true}
                    requireEmailVerification={true}
                    allowedUserTypes={['company', 'organization', 'admin']}
                  >
                    <PostJob />
                  </ProtectedRoute>
                }
              />
              <Route path="/create-admin" element={<CreateAdmin />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
