import { UserProfile } from "@/components/profile/user-profile";
import { MentorProfilePage } from "@/components/profile/mentor-profile-page";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">
          Please log in to view your profile
        </h3>
      </div>
    );
  }

  // If user is a mentor, show both user profile and mentor profile tabs
  if (user.role === "mentor") {
    return (
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Your Profile</h2>
          <p className="text-muted-foreground">
            Manage your personal and mentor profiles
          </p>
        </div>

        <Tabs defaultValue="user">
          <TabsList className="mb-4">
            <TabsTrigger value="user">User Profile</TabsTrigger>
            <TabsTrigger value="mentor">Mentor Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="user">
            <UserProfile />
          </TabsContent>

          <TabsContent value="mentor">
            <MentorProfilePage />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // If user is a mentee, just show the user profile
  return <UserProfile />;
}
