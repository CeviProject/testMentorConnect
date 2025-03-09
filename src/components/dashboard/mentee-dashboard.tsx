import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getUserSessions } from "@/lib/api";
import { Session } from "@/types";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, User } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

export function MenteeDashboard() {
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
      if (user) {
        const data = await getUserSessions(user.id, "mentee");
        setSessions(data);
      }
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
        const startTime = new Date(row.getValue("startTime"));
        const endTime = new Date(row.original.endTime);
        return (
          <div className="flex flex-col">
            <span>{startTime.toLocaleDateString()}</span>
            <span className="text-muted-foreground">
              {startTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              -
              {endTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "mentorId",
      header: "Mentor",
      cell: ({ row }) => {
        // In a real app, you would fetch the mentor's name
        return <span>Mentor {row.original.mentorId.substring(0, 8)}</span>;
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
        if (
          session.status === "confirmed" &&
          new Date(session.startTime) > new Date()
        ) {
          return (
            <Button
              size="sm"
              onClick={() => navigate(`/sessions/${session.id}`)}
            >
              View Details
            </Button>
          );
        } else {
          return (
            <Button
              size="sm"
              onClick={() => navigate(`/sessions/${session.id}`)}
            >
              View Summary
            </Button>
          );
        }
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
        <h2 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.name}
        </h2>
        <p className="text-muted-foreground">
          Manage your mentoring sessions and find new mentors
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Requests
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingSessions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Sessions
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingSessions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Sessions
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pastSessions.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Sessions</CardTitle>
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
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate("/mentors")}>
            Find Mentors
          </Button>
          <Button onClick={() => navigate("/profile")}>Update Profile</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
