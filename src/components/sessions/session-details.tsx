import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
import { Textarea } from "@/components/ui/textarea";
import { format, parseISO } from "date-fns";
import { VideoCall } from "@/components/video/video-call";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, Clock, Video, FileText, CreditCard } from "lucide-react";
import { PaymentForm } from "@/components/payment/payment-form";

export function SessionDetails() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  useEffect(() => {
    if (sessionId) {
      fetchSessionData(sessionId);
    }
  }, [sessionId]);

  const fetchSessionData = async (id: string) => {
    // For direct video call access
    if (id === "current-session") {
      const now = new Date();
      const inOneHour = new Date(now.getTime() + 3600000);
      const sessionData = {
        id: "current-session",
        mentorId: "mentor-1",
        menteeId: user?.id || "user-1",
        startTime: now.toISOString(),
        endTime: inOneHour.toISOString(),
        status: "confirmed",
        paymentStatus: "completed",
        notes: "",
      };
      setSession(sessionData);
      // Add a small delay before showing video call to ensure everything is loaded
      setTimeout(() => {
        setShowVideoCall(true);
      }, 500);
      return;
    }
    try {
      setIsLoading(true);

      // Mock session data
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      const mockSessions = {
        "session-1": {
          id: "session-1",
          mentorId: "mentor-1",
          menteeId: user?.id || "user-1",
          startTime: tomorrow.toISOString(),
          endTime: new Date(tomorrow.getTime() + 3600000).toISOString(),
          status: "confirmed",
          paymentStatus: "completed",
          notes: "Discuss career transition to senior developer role",
        },
        "session-2": {
          id: "session-2",
          mentorId: "mentor-2",
          menteeId: user?.id || "user-1",
          startTime: nextWeek.toISOString(),
          endTime: new Date(nextWeek.getTime() + 3600000).toISOString(),
          status: "requested",
          paymentStatus: "pending",
        },
        "session-3": {
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
      };

      // For demo purposes, create a session that's happening now
      const now = new Date();
      const inOneHour = new Date(now.getTime() + 3600000);

      if (id === "current-session") {
        setSession({
          id: "current-session",
          mentorId: "mentor-1",
          menteeId: user?.id || "user-1",
          startTime: now.toISOString(),
          endTime: inOneHour.toISOString(),
          status: "confirmed",
          paymentStatus: "completed",
          notes: "",
        });
      } else {
        setSession(mockSessions[id as keyof typeof mockSessions] || null);
      }

      if (mockSessions[id as keyof typeof mockSessions]) {
        setNotes(mockSessions[id as keyof typeof mockSessions].notes || "");
      }
    } catch (error) {
      console.error("Error fetching session data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!sessionId) return;

    try {
      setIsSaving(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update local state
      if (session) {
        setSession({
          ...session,
          notes: notes,
        });
      }

      alert("Notes saved successfully!");
    } catch (error) {
      console.error("Error saving notes:", error);
      alert("Failed to save notes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCompleteSession = async () => {
    if (!sessionId || !session) return;

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update local state
      setSession({
        ...session,
        status: "completed",
      });

      alert("Session marked as completed!");
    } catch (error) {
      console.error("Error completing session:", error);
      alert("Failed to complete session. Please try again.");
    }
  };

  const handleProcessPayment = async () => {
    if (!sessionId || !session) return;

    try {
      setPaymentProcessing(true);
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update session payment status
      setSession({
        ...session,
        paymentStatus: "completed",
      });

      alert("Payment processed successfully!");
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Payment processing failed. Please try again.");
    } finally {
      setPaymentProcessing(false);
    }
  };

  const isUpcoming =
    session &&
    session.status === "confirmed" &&
    new Date(session.startTime) > new Date();

  const isOngoing =
    session &&
    session.status === "confirmed" &&
    new Date(session.startTime) <= new Date() &&
    new Date(session.endTime) >= new Date();

  const isPast =
    session &&
    (session.status === "completed" ||
      (session.status === "confirmed" &&
        new Date(session.endTime) < new Date()));

  const canJoin = isOngoing && session?.paymentStatus === "completed";
  const needsPayment =
    session?.status === "confirmed" && session?.paymentStatus === "pending";

  if (isLoading) {
    return <div className="flex justify-center py-12">Loading...</div>;
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">Session not found</h3>
        <Button className="mt-4" onClick={() => navigate("/sessions")}>
          Back to Sessions
        </Button>
      </div>
    );
  }

  // Map mentor IDs to names for demo purposes
  const mentorNames = {
    "mentor-1": "John Smith",
    "mentor-2": "Sarah Johnson",
    "mentor-3": "Michael Chen",
    "mentor-4": "Lisa Rodriguez",
  };

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => navigate("/sessions")}>
        Back to Sessions
      </Button>

      {showVideoCall ? (
        <VideoCall
          session={session}
          onEnd={() => {
            setShowVideoCall(false);
            handleCompleteSession();
          }}
        />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">
              Session Details
            </h2>
            <p className="text-muted-foreground">
              {isUpcoming
                ? "Upcoming session"
                : isPast
                  ? "Past session"
                  : "Ongoing session"}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Session Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Date</p>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <p>
                        {format(parseISO(session.startTime), "MMMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Time</p>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <p>
                        {format(parseISO(session.startTime), "h:mm a")} -{" "}
                        {format(parseISO(session.endTime), "h:mm a")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {user?.role === "mentor" ? "Mentee" : "Mentor"}
                  </p>
                  <p>
                    {user?.role === "mentor"
                      ? `Mentee ${session.menteeId.substring(0, 8)}`
                      : mentorNames[
                          session.mentorId as keyof typeof mentorNames
                        ] || `Mentor ${session.mentorId.substring(0, 8)}`}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium">Status</p>
                  <div className="flex items-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        session.status === "requested"
                          ? "bg-yellow-100 text-yellow-800"
                          : session.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : session.status === "completed"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                      }`}
                    >
                      {session.status.charAt(0).toUpperCase() +
                        session.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium">Payment Status</p>
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        session.paymentStatus === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : session.paymentStatus === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {session.paymentStatus.charAt(0).toUpperCase() +
                        session.paymentStatus.slice(1)}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                {needsPayment && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full">Process Payment</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <PaymentForm
                        session={session}
                        onPaymentComplete={handleProcessPayment}
                      />
                    </DialogContent>
                  </Dialog>
                )}

                {canJoin && (
                  <Button
                    className="w-full"
                    onClick={() => setShowVideoCall(true)}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Join Video Call
                  </Button>
                )}

                {!canJoin && !needsPayment && isUpcoming && (
                  <Alert>
                    <AlertDescription>
                      This session is scheduled for{" "}
                      {format(
                        parseISO(session.startTime),
                        "MMMM d, yyyy 'at' h:mm a",
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Session Notes</CardTitle>
                <CardDescription>
                  {isPast
                    ? "Review notes from this session"
                    : "Take notes during your session"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add your notes here..."
                  className="min-h-[200px]"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isPast && user?.role === "mentee"}
                />
              </CardContent>
              <CardFooter>
                {(user?.role === "mentor" ||
                  (!isPast && user?.role === "mentee")) && (
                  <Button
                    onClick={handleSaveNotes}
                    disabled={isSaving}
                    className="w-full"
                  >
                    {isSaving ? "Saving..." : "Save Notes"}
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>

          {isPast && session.transcript && (
            <Card>
              <CardHeader>
                <CardTitle>Session Transcript</CardTitle>
                <CardDescription>
                  Automatically generated transcript from your session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-[400px] overflow-y-auto p-4 border rounded-md bg-muted/50">
                  <pre className="whitespace-pre-wrap font-sans">
                    {session.transcript}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
