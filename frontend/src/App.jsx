import React, { lazy, Suspense } from "react"; // ADDED lazy and Suspense for better user-experience
import { Navigate, Route, Routes } from "react-router";
import { HelmetProvider } from "react-helmet-async";

import { Toaster } from "react-hot-toast";
import PageLoader from "./components/PageLoader.jsx";
import useAuthUser from "./hooks/useAuthUser.jsx";
import Layout from "./components/Layout.jsx";
import { useThemeStore } from "./store/useThemeStore.js";
import FriendsPage from "./pages/FriendsPage.jsx";
import DefaultMeta from "./components/DefaultMeta.jsx";

const HomePage = lazy(() => import("./pages/HomePage.jsx"));
const SignUpPage = lazy(() => import("./pages/SignupPage.jsx"));
const LoginPage = lazy(() => import("./pages/LoginPage.jsx"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage.jsx"));
const CallPage = lazy(() => import("./pages/CallPage.jsx"));
const ChatPage = lazy(() => import("./pages/ChatPage.jsx"));
const OnboardingPage = lazy(() => import("./pages/OnboardingPage.jsx"));
const VerifyOTPPage = lazy(() => import("./pages/VerifyOTPPage.jsx"));

const App = () => {
  const { isLoading, authUser } = useAuthUser();
  const { theme } = useThemeStore();

  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;

  // If the initial authUser data is still loading, show loading spinner
  if (isLoading) return <PageLoader />;

  return (
    <HelmetProvider>
      <div className="h-screen" data-theme={theme}>
        <DefaultMeta />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route
              path="/"
              element={
                isAuthenticated && isOnboarded ? (
                  <Layout showSidebar={true}>
                    <HomePage />
                  </Layout>
                ) : (
                  <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
                )
              }
            />
            <Route
              path="/signup"
              element={
                !isAuthenticated ? (
                  <SignUpPage />
                ) : (
                  <Navigate to={isOnboarded ? "/" : "/onboarding"} />
                )
              }
            />
            <Route
              path="/login"
              element={
                !isAuthenticated ? (
                  <LoginPage />
                ) : (
                  <Navigate to={isOnboarded ? "/" : "/onboarding"} />
                )
              }
            />
            <Route
              path="/notifications"
              element={
                isAuthenticated && isOnboarded ? (
                  <Layout showSidebar={true}>
                    <NotificationsPage />
                  </Layout>
                ) : (
                  <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
                )
              }
            />

            <Route
              path="/friends"
              element={
                isAuthenticated && isOnboarded ? (
                  <Layout showSidebar={true}>
                    <FriendsPage />
                  </Layout>
                ) : (
                  <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
                )
              }
            />
            <Route
              path="/call/:id"
              element={
                isAuthenticated && isOnboarded ? (
                  <CallPage />
                ) : (
                  <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
                )
              }
            />

            <Route
              path="/chat/:id"
              element={
                isAuthenticated && isOnboarded ? (
                  <Layout showSidebar={false}>
                    <ChatPage />
                  </Layout>
                ) : (
                  <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
                )
              }
            />

            <Route
              path="/onboarding"
              element={
                isAuthenticated ? (
                  !isOnboarded ? (
                    <OnboardingPage />
                  ) : (
                    <Navigate to="/" />
                  )
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route path="/verify-otp" element={<VerifyOTPPage />} />
          </Routes>
        </Suspense>

        <Toaster />
      </div>
    </HelmetProvider>
  );
};

export default App;
