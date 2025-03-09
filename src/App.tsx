import { Suspense, lazy } from "react";
import { useRoutes, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./components/layout/main-layout";
import { AuthProvider } from "./contexts/AuthContext";
import routes from "tempo-routes";

// Lazy load components
const Home = lazy(() => import("./components/home"));
const LoginForm = lazy(() =>
  import("./components/auth/login-form").then((module) => ({
    default: module.LoginForm,
  })),
);
const RegisterForm = lazy(() =>
  import("./components/auth/register-form").then((module) => ({
    default: module.RegisterForm,
  })),
);
const MentorDashboard = lazy(() =>
  import("./components/dashboard/mentor-dashboard").then((module) => ({
    default: module.MentorDashboard,
  })),
);
const MenteeDashboard = lazy(() =>
  import("./components/dashboard/mentee-dashboard").then((module) => ({
    default: module.MenteeDashboard,
  })),
);
const MentorList = lazy(() =>
  import("./components/mentors/mentor-list").then((module) => ({
    default: module.MentorList,
  })),
);
const MentorProfile = lazy(() =>
  import("./components/mentors/mentor-profile").then((module) => ({
    default: module.MentorProfile,
  })),
);
const AvailabilityManager = lazy(() =>
  import("./components/availability/availability-manager").then((module) => ({
    default: module.AvailabilityManager,
  })),
);

function App() {
  return (
    <AuthProvider>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            Loading...
          </div>
        }
      >
        <MainLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/dashboard" element={<Home />} />
            <Route path="/mentors" element={<MentorList />} />
            <Route path="/mentors/:mentorId" element={<MentorProfile />} />
            <Route path="/availability" element={<AvailabilityManager />} />
          </Routes>
          {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
        </MainLayout>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
