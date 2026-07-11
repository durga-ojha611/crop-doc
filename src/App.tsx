import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import OfflineIndicator from "@/components/OfflineIndicator";
import RequireVerifiedEmail from "@/components/auth/RequireVerifiedEmail";
import RequireAuth from "@/components/auth/RequireAuth";
import Index from "./pages/Index";
import ScanPage from "./pages/ScanPage";
import CommunityPage from "./pages/CommunityPage";
import ProfilePage from "./pages/ProfilePage";
import AuthPage from "./pages/AuthPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import HistoryPage from "./pages/HistoryPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import ChatbotPage from "./pages/ChatbotPage";
import MyFieldsPage from "./pages/MyFieldsPage";
import PlotDetailPage from "./pages/PlotDetailPage";
import MenuPage from "./pages/MenuPage";
import InfoPage from "./pages/InfoPage";
import { ErrorBoundary } from "./components/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <OfflineIndicator />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/scan" element={
                <RequireAuth>
                  <ScanPage />
                </RequireAuth>
              } />
              <Route path="/community" element={
                <RequireVerifiedEmail>
                  <CommunityPage />
                </RequireVerifiedEmail>
              } />
              <Route path="/chat" element={
                <RequireAuth>
                  <ErrorBoundary>
                    <ChatbotPage />
                  </ErrorBoundary>
                </RequireAuth>
              } />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/menu" element={
                <RequireAuth>
                  <MenuPage />
                </RequireAuth>
              } />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/history" element={
                <RequireVerifiedEmail>
                  <HistoryPage />
                </RequireVerifiedEmail>
              } />
              <Route path="/settings" element={
                <RequireVerifiedEmail>
                  <SettingsPage />
                </RequireVerifiedEmail>
              } />
              <Route path="/fields" element={
                <RequireAuth>
                  <MyFieldsPage />
                </RequireAuth>
              } />
              <Route path="/plots/:id" element={
                <RequireAuth>
                  <PlotDetailPage />
                </RequireAuth>
              } />
              <Route path="/info" element={<InfoPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
