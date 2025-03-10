import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { MentorProfileForm } from "@/components/mentors/mentor-profile-form";
import { AvailabilityManager } from "@/components/availability/availability-manager";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function MentorProfilePage() {
  const { user } = useAuth();

  if (!user || user.role !== "mentor") {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">Access Denied</h3>
        <p className="text-muted-foreground mt-2">
          Only mentors can access this page
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Mentor Profile</h2>
        <p className="text-muted-foreground">
          Manage your mentor profile and availability
        </p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <MentorProfileForm />
        </TabsContent>

        <TabsContent value="availability">
          <AvailabilityManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
