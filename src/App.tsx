import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PublicLayout } from './components/layouts/PublicLayout';
import { AppShell } from './components/layouts/AppShell';
import { ProtectedRoute } from './components/layouts/ProtectedRoute';
import { HomePage } from './pages/public/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignUpPage } from './pages/auth/SignUpPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { ApplyPage } from './pages/application/ApplyPage';
import { ApplicationStatusPage } from './pages/application/ApplicationStatusPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminApplications } from './pages/admin/AdminApplications';
import { AdminApplicationDetail } from './pages/admin/AdminApplicationDetail';
import { AdminDealers } from './pages/admin/AdminDealers';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminSettings } from './pages/admin/AdminSettings';
import { DealerDashboardPage } from './pages/dealer/DealerDashboardPage';
import { DealerSubmissions } from './pages/dealer/DealerSubmissions';
import { DealerSubmissionDetail } from './pages/dealer/DealerSubmissionDetail';
import { DealerOffers } from './pages/dealer/DealerOffers';
import { DealerCustomers } from './pages/dealer/DealerCustomers';
import { DealerPortalSettings } from './pages/dealer/DealerPortalSettings';
import { DealerSettings } from './pages/dealer/DealerSettings';
import { CustomerPortalPage } from './pages/portal/CustomerPortalPage';
import { SubmissionFormPage } from './pages/portal/SubmissionFormPage';
import { SubmissionStatusPage } from './pages/portal/SubmissionStatusPage';
import { NotFoundPage } from './pages/public/NotFoundPage';

const App: React.FC = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        {/* Public pages with Navbar + Footer */}
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="application-status" element={<ApplicationStatusPage />} />
        </Route>

        {/* Standalone auth pages (own full-screen layouts) */}
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignUpPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="apply" element={<ApplyPage />} />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AppShell variant="admin" />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="applications" element={<AdminApplications />} />
          <Route path="applications/:id" element={<AdminApplicationDetail />} />
          <Route path="dealers" element={<AdminDealers />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Dealer routes */}
        <Route
          path="/app"
          element={
            <ProtectedRoute requireDealer>
              <AppShell variant="dealer" />
            </ProtectedRoute>
          }
        >
          <Route index element={<DealerDashboardPage />} />
          <Route path="submissions" element={<DealerSubmissions />} />
          <Route path="submissions/:id" element={<DealerSubmissionDetail />} />
          <Route path="offers" element={<DealerOffers />} />
          <Route path="customers" element={<DealerCustomers />} />
          <Route path="portal" element={<DealerPortalSettings />} />
          <Route path="settings" element={<DealerSettings />} />
        </Route>

        {/* Customer portal */}
        <Route path="/portal/:slug" element={<CustomerPortalPage />} />
        <Route path="/portal/:slug/submit" element={<SubmissionFormPage />} />
        <Route path="/portal/:slug/status/:token" element={<SubmissionStatusPage />} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
