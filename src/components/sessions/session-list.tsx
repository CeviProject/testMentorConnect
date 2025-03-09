import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Session } from "@/types";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { format, parseISO } from "date-fns";

export function SessionList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);

      // Mock sessions data
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      const mockSessions: Session[] = [
        {
          id: "session-1",
          mentorId: "mentor-1",
          menteeId: user?.id || "user-1",
          startTime: tomorrow.toISOString(),
          endTime: new Date(tomorrow.getTime() + 3600000).toISOString(),
          status: "confirmed",
          paymentStatus: "completed",
          notes: "Discuss career transition to senior developer role",
        },
        {
          id: "session-2",
          mentorId: "mentor-2",
          menteeId: user?.id || "user-1",
          startTime: nextWeek.toISOString(),
          endTime: new Date(nextWeek.getTime() + 3600000).toISOString(),
          status: "requested",
          paymentStatus: "pending",
        },
        {
          id: "session-3",
          mentorId: "mentor-3",
          menteeId: user?.id || "user-1",
          startTime: yesterday.toISOString(),
          endTime: new Date(yesterday.getTime() + 3600000).toISOString(),
          status: "completed",
          paymentStatus: "completed",
          notes: "Reviewed portfolio and discussed improvement areas",
          transcript: "This is a sample transcript of our conversation...",
        },
      ];

      setSessions(mockSessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const pendingSessions = sessions.filter(
    (session) => session.status === "requested",
  );
  const upcomingSessions = sessions.filter(
    (session) =>
      session.status === "confirmed" &&
      new Date(session.startTime) > new Date(),
  );
  const pastSessions = sessions.filter(
    (session) =>
      session.status === "completed" ||
      (session.status === "confirmed" &&
        new Date(session.endTime) < new Date()),
  );

  const columns: ColumnDef<Session>[] = [
    {
      accessorKey: "startTime",
      header: "Date & Time",
      cell: ({ row }) => {
        const startTime = parseISO(row.getValue("startTime"));
        const endTime = parseISO(row.original.endTime);
        return (
          <div className="flex flex-col">
            <span>{format(startTime, "MMM d, yyyy")}</span>
            <span className="text-muted-foreground">
              {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: user?.role === "mentor" ? "menteeId" : "mentorId",
      header: user?.role === "mentor" ? "Mentee" : "Mentor",
      cell: ({ row }) => {
        const id =
          user?.role === "mentor"
            ? row.original.menteeId
            : row.original.mentorId;

        // Map IDs to names for demo purposes
        const mentorNames = {
          "mentor-1": "John Smith",
          "mentor-2": "Sarah Johnson",
          "mentor-3": "Michael Chen",
          "mentor-4": "Lisa Rodriguez",
        };

        return (
          <span>
            {mentorNames[id as keyof typeof mentorNames] || id.substring(0, 8)}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <div className="flex items-center">
            <span
              className={`px-2 py-1 rounded-full text-xs ${getStatusColor(status)}`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const session = row.original;
        return (
          <Button size="sm" onClick={() => navigate(`/sessions/${session.id}`)}>
            View Details
          </Button>
        );
      },
    },
  ];

  function getStatusColor(status: string) {
    switch (status) {
      case "requested":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "declined":
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Your Sessions</h2>
        <p className="text-muted-foreground">
          View and manage your mentoring sessions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
          <CardDescription>
            View and manage your mentoring sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upcoming">
            <TabsList className="mb-4">
              <TabsTrigger value="pending">
                Pending ({pendingSessions.length})
              </TabsTrigger>
              <TabsTrigger value="upcoming">
                Upcoming ({upcomingSessions.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                Past ({pastSessions.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="pending">
              {isLoading ? (
                <div className="flex justify-center py-8">Loading...</div>
              ) : pendingSessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No pending session requests
                </div>
              ) : (
                <DataTable columns={columns} data={pendingSessions} />
              )}
            </TabsContent>
            <TabsContent value="upcoming">
              {isLoading ? (
                <div className="flex justify-center py-8">Loading...</div>
              ) : upcomingSessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No upcoming sessions
                </div>
              ) : (
                <DataTable columns={columns} data={upcomingSessions} />
              )}
            </TabsContent>
            <TabsContent value="past">
              {isLoading ? (
                <div className="flex justify-center py-8">Loading...</div>
              ) : pastSessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No past sessions
                </div>
              ) : (
                <DataTable columns={columns} data={pastSessions} />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
