import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Session } from "@/types";
import { format, parseISO } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, FileText, MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export function SessionHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pastSessions, setPastSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [followUpMessage, setFollowUpMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPastSessions();
    }
  }, [user]);

  const fetchPastSessions = async () => {
    try {
      setIsLoading(true);

      // Mock past sessions data
      const today = new Date();
      const mockSessions: Session[] = [];

      // Generate 5 past sessions
      for (let i = 1; i <= 5; i++) {
        const pastDate = new Date(today);
        pastDate.setDate(pastDate.getDate() - i * 7); // Each session is 1 week apart

        mockSessions.push({
          id: `past-session-${i}`,
          mentorId: `mentor-${(i % 4) + 1}`,
          menteeId: user?.id || "user-1",
          startTime: pastDate.toISOString(),
          endTime: new Date(pastDate.getTime() + 3600000).toISOString(),
          status: "completed",
          paymentStatus: "completed",
          notes: `Notes from session ${i}: Discussed career growth and technical skills development.`,
          transcript: `This is the transcript from session ${i}. It includes the conversation between mentor and mentee.`,
        });
      }

      setPastSessions(mockSessions);
    } catch (error) {
      console.error("Error fetching past sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendFollowUp = async () => {
    if (!selectedSession || !followUpMessage.trim()) return;

    try {
      setIsSending(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert("Follow-up message sent successfully!");
      setFollowUpMessage("");
      setSelectedSession(null);
    } catch (error) {
      console.error("Error sending follow-up message:", error);
      alert("Failed to send follow-up message");
    } finally {
      setIsSending(false);
    }
  };

  const handleScheduleFollowUp = (session: Session) => {
    navigate(`/mentors/${session.mentorId}`);
  };

  // Map mentor IDs to names for demo purposes
  const mentorNames = {
    "mentor-1": "John Smith",
    "mentor-2": "Sarah Johnson",
    "mentor-3": "Michael Chen",
    "mentor-4": "Lisa Rodriguez",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Session History</h2>
        <p className="text-muted-foreground">
          Review your past mentoring sessions and track your progress
        </p>
      </div>

      <Tabs defaultValue="list">
        <TabsList className="mb-4">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          {isLoading ? (
            <div className="flex justify-center py-12">Loading...</div>
          ) : pastSessions.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No past sessions</h3>
              <p className="text-muted-foreground mt-2">
                You haven't had any mentoring sessions yet
              </p>
              <Button className="mt-4" onClick={() => navigate("/mentors")}>
                Find a Mentor
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {pastSessions.map((session) => (
                <Card key={session.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {format(
                              parseISO(session.startTime),
                              "MMMM d, yyyy",
                            )}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {format(parseISO(session.startTime), "h:mm a")} -{" "}
                            {format(parseISO(session.endTime), "h:mm a")}
                          </span>
                        </div>
                        <div className="font-medium">
                          Session with{" "}
                          {mentorNames[
                            session.mentorId as keyof typeof mentorNames
                          ] || `Mentor ${session.mentorId.substring(0, 8)}`}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/sessions/${session.id}`)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View Details
                        </Button>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedSession(session)}
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Send Follow-up
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Send Follow-up Message</DialogTitle>
                              <DialogDescription>
                                Send a message to your mentor about this session
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="text-sm">
                                <span className="font-medium">
                                  Session Date:{" "}
                                </span>
                                {format(
                                  parseISO(session.startTime),
                                  "MMMM d, yyyy",
                                )}
                              </div>
                              <div className="text-sm">
                                <span className="font-medium">Mentor: </span>
                                {mentorNames[
                                  session.mentorId as keyof typeof mentorNames
                                ] ||
                                  `Mentor ${session.mentorId.substring(0, 8)}`}
                              </div>
                              <Textarea
                                placeholder="Type your follow-up message here..."
                                value={followUpMessage}
                                onChange={(e) =>
                                  setFollowUpMessage(e.target.value)
                                }
                                className="min-h-[150px]"
                              />
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSelectedSession(null);
                                  setFollowUpMessage("");
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleSendFollowUp}
                                disabled={isSending || !followUpMessage.trim()}
                              >
                                {isSending ? "Sending..." : "Send Message"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <Button
                          size="sm"
                          onClick={() => handleScheduleFollowUp(session)}
                        >
                          Schedule Follow-up
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Calendar View</CardTitle>
              <CardDescription>
                View your past sessions in a calendar format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Calendar view is coming soon!
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
