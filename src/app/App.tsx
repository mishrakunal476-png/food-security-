import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { ChatWidget } from '../components/ChatWidget';
import { useAuth } from '../auth/AuthProvider';
import { useDemo } from '../state/DemoProvider';
import { LandingPage } from '../pages/LandingPage';
import { ExplorePage } from '../pages/ExplorePage';
import { LoginPage, OnboardingPage, ResetPasswordPage } from '../pages/AuthPages';
import { DashboardPage } from '../pages/DashboardPage';
import { DonationsPage, NewDonationPage, DonationDetailPage } from '../pages/DonationPages';
import { JobsPage, TrackingPage } from '../pages/DeliveryPages';
import { AdminPage, ImpactPage, NotificationsPage, ProfilePage, SupportPage } from '../pages/OperationsPages';
import { HelpPage, LegalPage, NotFoundPage } from '../pages/InfoPages';

function RequireWorkspace({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const { demoActive } = useDemo();
  if (loading) return <div className="loading-screen"><span className="loading-mark"><span /></span><p>Finding your place in the loop…</p></div>;
  if (!user && !demoActive) return <Navigate to="/login" replace />;
  if (user && !user.onboardingComplete) return <Navigate to="/onboarding" replace />;
  return children;
}

function Workspace() {
  return <RequireWorkspace><AppLayout /></RequireWorkspace>;
}

export function App() {
  return <>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/explore" element={<ExplorePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<LoginPage register />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route element={<Workspace />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/donations" element={<DonationsPage />} />
        <Route path="/donations/new" element={<NewDonationPage />} />
        <Route path="/donations/:donationId" element={<DonationDetailPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/tracking/:donationId" element={<TrackingPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/impact" element={<ImpactPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/food-safety" element={<LegalPage type="food-safety" />} />
        <Route path="/privacy" element={<LegalPage type="privacy" />} />
        <Route path="/terms" element={<LegalPage type="terms" />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    <ChatWidget />
  </>;
}
