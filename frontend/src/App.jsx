import React, { lazy, Suspense } from "react"; // ADDED lazy and Suspense for better user-experience
import { Navigate, Route, Routes } from "react-router";

import { Toaster } from "react-hot-toast";
import PageLoader from "./components/PageLoader.jsx";
import useAuthUser from "./hooks/useAuthUser.jsx";
import Layout from "./components/Layout.jsx"; 
import { useThemeStore } from "./store/useThemeStore.js";

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
    <div className="h-screen" data-theme={theme}>
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
            element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
          />
          <Route
            path="/login"
            element={!authUser ? <LoginPage /> : <Navigate to="/" />}
          />
          <Route
            path="/notifications"
            element={authUser ? <NotificationsPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/call"
            element={authUser ? <CallPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/chat"
            element={authUser ? <ChatPage /> : <Navigate to="/login" />}
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
  );
};

export default App;