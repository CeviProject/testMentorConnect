import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Session } from "@/types";
import {
  updateSessionTranscript,
  updateSessionNotes,
  createVideoCall,
  updateVideoCallStatus,
  updateSessionStatus,
} from "@/lib/api";
import { createZegoCall } from "@/lib/zegocloud";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  Share2,
  Copy,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";

interface VideoCallProps {
  session: Session;
  onEnd: () => void;
}

export function VideoCall({ session, onEnd }: VideoCallProps) {
  const { user } = useAuth();
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [notes, setNotes] = useState(session.notes || "");
  const [transcript, setTranscript] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [notesShared, setNotesShared] = useState(false);
  const [callTime, setCallTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [zegoCall, setZegoCall] = useState<any>(null);
  const zegoContainerRef = useRef<HTMLDivElement>(null);

  // Call configuration
  const callId = session.id;
  const userId = user?.id || "user-1";
  const userName = user?.name || "User";

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Timer for call duration
  useEffect(() => {
    const timer = setInterval(() => {
      setCallTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format call time
  const formatCallTime = () => {
    const minutes = Math.floor(callTime / 60);
    const seconds = callTime % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Simulated transcript generation
  useEffect(() => {
    const transcriptLines = [
      "Hello, how are you today?",
      "I'm doing well, thank you for joining this session.",
      "Let's discuss your progress since our last meeting.",
      "I've been working on the exercises you recommended.",
      "That's great to hear! Have you encountered any challenges?",
      "Yes, I had some difficulty with the advanced concepts.",
      "Let me explain those in more detail today.",
      "The key is to break down the problem into smaller parts.",
      "That makes sense. I'll try that approach.",
      "Let's set some goals for our next session.",
      "I'd like to complete the project we discussed.",
      "That's a good goal. Let's also focus on improving your problem-solving skills.",
    ];

    let currentLine = 0;

    const interval = setInterval(() => {
      if (currentLine < transcriptLines.length) {
        setTranscript((prev) => prev + "\n" + transcriptLines[currentLine]);
        currentLine++;
      } else {
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Initialize ZegoCloud Video client
  useEffect(() => {
    console.log("Setting up ZegoCloud call");
    const setupZegoCall = async () => {
      try {
        // If this is a new call, create a record in the database
        if (!session.videoCallId) {
          try {
            const callId = `call-${session.id}`;
            await createVideoCall(session.id, callId);
          } catch (dbError) {
            console.error("Error creating video call record:", dbError);
            // Continue even if database record creation fails
          }
        }

        // Update video call status to started
        if (session.videoCallId) {
          try {
            await updateVideoCallStatus(session.videoCallId, "started");
          } catch (statusError) {
            console.error("Error updating video call status:", statusError);
            // Continue even if status update fails
          }
        }

        // Initialize ZegoCloud call if container ref is available
        if (zegoContainerRef.current) {
          console.log("Container ref is available, creating ZegoCloud call");
          const roomID = session.videoCallId || `call-${session.id}`;
          console.log("Room ID:", roomID);
          console.log("User ID:", userId);
          console.log("User Name:", userName);

          // Add a small delay to ensure the container is fully rendered
          setTimeout(() => {
            const zc = createZegoCall(
              zegoContainerRef.current!,
              roomID,
              userId,
              userName,
              handleEndCall,
            );
            console.log("ZegoCloud call created:", zc);
            setZegoCall(zc);
          }, 500);
        } else {
          console.error("Container ref is not available");
        }
      } catch (error) {
        console.error("Error setting up call:", error);
        setTranscript(
          "Error setting up video call. Please check your configuration.",
        );
      }
    };

    setupZegoCall();

    return () => {
      // Clean up
      if (zegoCall) {
        try {
          // ZegoCloud handles cleanup internally when the component unmounts
        } catch (error) {
          console.error("Error during call cleanup:", error);
        }
      }
    };
  }, []);

  const handleEndCall = async () => {
    try {
      setIsSaving(true);

      // Save transcript and notes
      try {
        await updateSessionTranscript(session.id, transcript);
        await updateSessionNotes(session.id, notes);
      } catch (saveError) {
        console.error("Error saving transcript/notes:", saveError);
        // Continue with ending the call even if saving fails
      }

      // Update video call status to ended
      if (session.videoCallId) {
        try {
          await updateVideoCallStatus(session.videoCallId, "ended");
        } catch (statusError) {
          console.error("Error updating video call status:", statusError);
          // Continue with ending the call even if status update fails
        }
      }

      // Update session status to completed
      try {
        await updateSessionStatus(session.id, "completed");
      } catch (sessionError) {
        console.error("Error updating session status:", sessionError);
      }

      onEnd();
    } catch (error) {
      console.error("Error ending call:", error);
      // Still call onEnd() to ensure the user can exit the call view
      onEnd();
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotes = async () => {
    try {
      setIsSaving(true);
      await updateSessionNotes(session.id, notes);
      alert("Notes saved successfully!");
    } catch (error) {
      console.error("Error saving notes:", error);
      alert("Failed to save notes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleShareNotes = () => {
    // In a real app, this would send the notes to the other participant
    setNotesShared(true);
    setTimeout(() => setNotesShared(false), 3000);
  };

  const toggleMic = async () => {
    // ZegoCloud handles mic toggling through its UI
    setMicEnabled(!micEnabled);
  };

  const toggleVideo = async () => {
    // ZegoCloud handles video toggling through its UI
    setVideoEnabled(!videoEnabled);
  };

  const toggleRecording = async () => {
    // ZegoCloud has built-in recording functionality
    setIsRecording(!isRecording);
    if (!isRecording) {
      alert("Recording started");
    } else {
      alert("Recording stopped and saved");
    }
  };

  const toggleScreenShare = async () => {
    // ZegoCloud handles screen sharing through its UI
    setIsSharing(!isSharing);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">Video Session</h2>
          <div className="flex items-center space-x-2">
            <div className="px-3 py-1 bg-primary/10 rounded-full text-sm font-medium">
              {formatCallTime()}
            </div>
            <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Live
            </div>
          </div>
        </div>
        <p className="text-muted-foreground">
          {user?.role === "mentor"
            ? `Session with Mentee ${session.menteeId.substring(0, 8)}`
            : `Session with Mentor ${session.mentorId.substring(0, 8)}`}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <div ref={zegoContainerRef} className="w-full h-full">
              {/* Recording indicator */}
              {isRecording && (
                <div className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white rounded-full flex items-center space-x-2 z-10">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                  <span className="text-sm font-medium">Recording</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <Button
              variant={micEnabled ? "outline" : "destructive"}
              size="icon"
              onClick={toggleMic}
              title="Toggle Microphone"
            >
              {micEnabled ? (
                <Mic className="h-5 w-5" />
              ) : (
                <MicOff className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant={videoEnabled ? "outline" : "destructive"}
              size="icon"
              onClick={toggleVideo}
              title="Toggle Camera"
            >
              {videoEnabled ? (
                <Video className="h-5 w-5" />
              ) : (
                <VideoOff className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant={isSharing ? "destructive" : "outline"}
              size="icon"
              onClick={toggleScreenShare}
              title="Share Screen"
            >
              <Share2 className="h-5 w-5" />
            </Button>
            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="icon"
              onClick={toggleRecording}
              title="Record Session"
            >
              <div className="relative">
                <div className="h-3 w-3 rounded-full bg-current"></div>
                {isRecording && (
                  <div className="absolute inset-0 h-3 w-3 rounded-full bg-current animate-ping"></div>
                )}
              </div>
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={handleEndCall}
              disabled={isSaving}
              title="End Call"
            >
              <Phone className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div>
          <Tabs defaultValue="notes">
            <TabsList className="w-full">
              <TabsTrigger value="notes" className="flex-1">
                Notes
              </TabsTrigger>
              <TabsTrigger value="transcript" className="flex-1">
                Transcript
              </TabsTrigger>
            </TabsList>
            <TabsContent value="notes" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Session Notes</CardTitle>
                  <CardDescription>
                    Take notes during your session
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {notesShared && (
                    <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                      <AlertDescription>
                        Notes shared successfully!
                      </AlertDescription>
                    </Alert>
                  )}
                  <Textarea
                    placeholder="Add your notes here..."
                    className="min-h-[300px]"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={handleShareNotes}>
                    <Copy className="h-4 w-4 mr-2" />
                    Share Notes
                  </Button>
                  <Button onClick={handleSaveNotes} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Notes"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="transcript" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Live Transcript</CardTitle>
                  <CardDescription>
                    Automatically generated transcript
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px] overflow-y-auto p-4 border rounded-md bg-muted/50">
                    <pre className="whitespace-pre-wrap font-sans">
                      {transcript ||
                        "Transcript will appear here as you speak..."}
                    </pre>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      navigator.clipboard.writeText(transcript);
                      alert("Transcript copied to clipboard");
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Transcript
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
