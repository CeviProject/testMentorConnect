import { lazy } from "react";
import { RouteObject } from "react-router-dom";

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
const SessionDetails = lazy(() =>
  import("./components/sessions/session-details").then((module) => ({
    default: module.SessionDetails,
  })),
);
const SessionList = lazy(() =>
  import("./components/sessions/session-list").then((module) => ({
    default: module.SessionList,
  })),
);
const SessionHistory = lazy(() =>
  import("./components/history/session-history").then((module) => ({
    default: module.SessionHistory,
  })),
);
const NotificationCenter = lazy(() =>
  import("./components/notifications/notification-center").then((module) => ({
    default: module.NotificationCenter,
  })),
);
const MentorProfilePage = lazy(() =>
  import("./components/profile/mentor-profile-page").then((module) => ({
    default: module.MentorProfilePage,
  })),
);
const ProfilePage = lazy(() =>
  import("./components/profile/profile-page").then((module) => ({
    default: module.ProfilePage,
  })),
);

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <LoginForm />,
  },
  {
    path: "/register",
    element: <RegisterForm />,
  },
  {
    path: "/dashboard",
    element: <Home />,
  },
  {
    path: "/mentors",
    element: <MentorList />,
  },
  {
    path: "/mentors/:mentorId",
    element: <MentorProfile />,
  },
  {
    path: "/availability",
    element: <AvailabilityManager />,
  },
  {
    path: "/sessions",
    element: <SessionList />,
  },
  {
    path: "/sessions/:sessionId",
    element: <SessionDetails />,
  },
  {
    path: "/history",
    element: <SessionHistory />,
  },
  {
    path: "/notifications",
    element: <NotificationCenter />,
  },
  {
    path: "/mentor-profile",
    element: <MentorProfilePage />,
  },
  {
    path: "/profile",
    element: <ProfilePage />,
  },
];

export default routes;
