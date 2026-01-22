import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Loader from "./components/Dashboard/Loader";
import ProtectedRoutes from "./components/ProtectedRoutes";
import DashboardLayout from "./layouts/DashboardLayout";
import ConsultantLayout from "./layouts/ConsultantLayout";

// Lazy load pages and components
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Login = lazy(() => import("./pages/Login"));
const SignUp = lazy(() => import("./pages/SignUp"));
const Home = lazy(() => import("./components/Dashboard/Home"));
const Checklist = lazy(() => import("./components/Dashboard/CheckList"));
const AiTools = lazy(() => import("./components/Dashboard/AiTools"));
const BusinessRegistration = lazy(() => import("./components/Dashboard/BusinessRegistration"));
const MarketingHub = lazy(() => import("./components/Dashboard/MarketingHub"));
const ComplianceHub = lazy(() => import("./components/Dashboard/ComplianceHub"));
const ConsultantBooking = lazy(() => import("./components/Dashboard/ConsultingBooking"));
const Onboarding = lazy(() => import("./components/Dashboard/Onboarding"));
const ExistingBusiness = lazy(() => import("./components/Dashboard/ExistingBusiness"));
const Profile = lazy(() => import("./components/Dashboard/Profile"));
const AssetsGallery = lazy(() => import("./components/Dashboard/AssetsGallery"));

const ConsultantDashboard = lazy(() => import("./components/Consultant/ConsultantDashboard"));
const CacVerification = lazy(() => import("./components/Consultant/CacVerification"));
const DesignRequests = lazy(() => import("./components/Consultant/DesignRequests"));
const ComplianceReviews = lazy(() => import("./components/Consultant/ComplianceReviews"));
const ConsultantTasks = lazy(() => import("./components/Consultant/ConsultantTasks"));
const ConsultantMessages = lazy(() => import("./components/Consultant/ConsultantMessages"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<div className="h-screen w-full flex items-center justify-center"><Loader /></div>}>
          <Routes>
            {/*PROTECTED ROUTES*/}

            <Route element={
              <ProtectedRoutes>
                <DashboardLayout />
              </ProtectedRoutes>}>

              <Route path="/dashboard/home" element={<Home />} />
              <Route path="/dashboard/checklist" element={<Checklist />} />
              <Route path="/dashboard/ai-tools" element={<AiTools />} />
              <Route path="/dashboard/cac" element={<BusinessRegistration />} />
              <Route path="/dashboard/marketing" element={<MarketingHub />} />
              <Route path="/dashboard/compliance" element={<ComplianceHub />} />
              <Route path="/dashboard/consulting" element={<ConsultantBooking />} />
              <Route path="/dashboard/onboarding" element={<Onboarding />} />
              <Route path="/dashboard/registration" element={<BusinessRegistration />} />
              <Route path="/dashboard/existing-business" element={<ExistingBusiness />} />
              <Route path="/dashboard/profile" element={<Profile />} />
              <Route path="/dashboard/assets" element={<AssetsGallery />} />

            </Route>

            {/* CONSULTANT ROUTES */}
            <Route element={
              <ProtectedRoutes>
                <ConsultantLayout />
              </ProtectedRoutes>
            }>
              <Route path="/consultant/dashboard" element={<ConsultantDashboard />} />
              <Route path="/consultant/cac-verification" element={<CacVerification />} />
              <Route path="/consultant/design-requests" element={<DesignRequests />} />
              <Route path="/consultant/compliance-reviews" element={<ComplianceReviews />} />
              <Route path="/consultant/tasks" element={<ConsultantTasks />} />
              <Route path="/consultant/messages" element={<ConsultantMessages />} />
            </Route>

            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<SignUp />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
