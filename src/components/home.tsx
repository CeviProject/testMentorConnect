import { useAuth } from "@/contexts/AuthContext";
import { MentorDashboard } from "./dashboard/mentor-dashboard";
import { MenteeDashboard } from "./dashboard/mentee-dashboard";
import { Navigate } from "react-router-dom";

function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center py-12">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="w-full">
      {user.role === "mentor" ? <MentorDashboard /> : <MenteeDashboard />}
    </div>
  );
}

export default Home;
