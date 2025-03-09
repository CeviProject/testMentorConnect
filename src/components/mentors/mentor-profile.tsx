import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { User, Availability } from "@/types";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format, addHours, isSameDay, parseISO } from "date-fns";

export function MentorProfile() {
  const { mentorId } = useParams<{ mentorId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [mentor, setMentor] = useState<User | null>(null);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [selectedSlot, setSelectedSlot] = useState<Availability | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (mentorId) {
      fetchMentorData(mentorId);
    }
  }, [mentorId]);

  const fetchMentorData = async (id: string) => {
    try {
      setIsLoading(true);

      // Mock mentor data
      const mockMentors = {
        "mentor-1": {
          id: "mentor-1",
          email: "john@example.com",
          name: "John Smith",
          role: "mentor",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
          bio: "Senior software engineer with 10+ years of experience in web development, cloud architecture, and team leadership. I specialize in React, Node.js, and AWS. I've helped dozens of developers advance their careers and technical skills through personalized mentoring sessions.",
          domains: ["Software Development", "Leadership", "Career Development"],
          hourlyRate: 75,
        },
        "mentor-2": {
          id: "mentor-2",
          email: "sarah@example.com",
          name: "Sarah Johnson",
          role: "mentor",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
          bio: "Data scientist specializing in machine learning and AI applications. Former research lead at Google. I help aspiring data scientists master Python, TensorFlow, and data visualization techniques. My mentees have gone on to roles at top tech companies.",
          domains: ["Data Science", "Software Development"],
          hourlyRate: 90,
        },
        "mentor-3": {
          id: "mentor-3",
          email: "michael@example.com",
          name: "Michael Chen",
          role: "mentor",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
          bio: "Product manager with experience at startups and Fortune 500 companies. Passionate about user-centered design. I can help you build your product management skills, create compelling product roadmaps, and develop effective stakeholder management strategies.",
          domains: ["Product Management", "UX/UI Design", "Business Strategy"],
          hourlyRate: 65,
        },
        "mentor-4": {
          id: "mentor-4",
          email: "lisa@example.com",
          name: "Lisa Rodriguez",
          role: "mentor",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lisa",
          bio: "Marketing executive with expertise in digital marketing, brand strategy, and growth hacking. I've helped scale multiple startups to acquisition. Let me help you develop your marketing skills and career path in this dynamic field.",
          domains: ["Marketing", "Business Strategy"],
          hourlyRate: 70,
        },
      };

      // Generate mock availability data
      const today = new Date();
      const mockAvailabilities: Availability[] = [];

      // Generate slots for the next 7 days
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);

        // Generate 3 slots per day
        for (let hour = 9; hour < 17; hour += 3) {
          const startTime = new Date(date);
          startTime.setHours(hour, 0, 0, 0);

          const endTime = new Date(startTime);
          endTime.setHours(startTime.getHours() + 1);

          mockAvailabilities.push({
            id: `slot-${i}-${hour}`,
            mentorId: id,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            isBooked: Math.random() > 0.7, // Randomly mark some as booked
          });
        }
      }

      setMentor(mockMentors[id] || null);
      setAvailabilities(mockAvailabilities.filter((slot) => !slot.isBooked));
    } catch (error) {
      console.error("Error fetching mentor data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookSession = async () => {
    if (!user || !mentor || !selectedSlot) return;

    try {
      setIsSubmitting(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock successful booking
      alert("Session request sent successfully!");
      setIsBookingDialogOpen(false);
      navigate("/sessions");
    } catch (error) {
      console.error("Error booking session:", error);
      alert("Failed to book session. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableSlotsForSelectedDate = availabilities.filter(
    (slot) => selectedDate && isSameDay(parseISO(slot.startTime), selectedDate),
  );

  if (isLoading) {
    return <div className="flex justify-center py-12">Loading...</div>;
  }

  if (!mentor) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">Mentor not found</h3>
        <Button className="mt-4" onClick={() => navigate("/mentors")}>
          Back to Mentors
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => navigate("/mentors")}>
        Back to Mentors
      </Button>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={mentor.avatar} alt={mentor.name} />
                <AvatarFallback className="text-2xl">
                  {mentor.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <CardTitle className="text-xl">{mentor.name}</CardTitle>
                <CardDescription>
                  {mentor.hourlyRate
                    ? `$${mentor.hourlyRate}/hour`
                    : "Rate not specified"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium">Expertise</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {mentor.domains?.map((domain) => (
                    <Badge key={domain} variant="secondary">
                      {domain}
                    </Badge>
                  )) || (
                    <span className="text-xs text-muted-foreground">
                      No domains specified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>About {mentor.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line">
              {mentor.bio || "No bio available"}
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Book a Session</CardTitle>
            <CardDescription>
              Select a date and time slot to book a session with {mentor.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="calendar">
              <TabsList className="mb-4">
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="list">List View</TabsTrigger>
              </TabsList>
              <TabsContent value="calendar" className="space-y-4">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <div className="mb-2 text-sm font-medium text-muted-foreground">
                      Days with available slots are highlighted in green
                    </div>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                      modifiers={{
                        available: availabilities
                          .filter((slot) => !slot.isBooked)
                          .map((slot) => new Date(slot.startTime)),
                      }}
                      modifiersClassNames={{
                        available: "bg-green-50 font-medium text-green-900",
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      Available Slots for{" "}
                      {selectedDate
                        ? format(selectedDate, "MMMM d, yyyy")
                        : "Selected Date"}
                    </h3>
                    {availableSlotsForSelectedDate.length === 0 ? (
                      <p className="text-muted-foreground">
                        No available slots for this date
                      </p>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-sm text-muted-foreground mb-2">
                          Select a time slot to book a session
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {availableSlotsForSelectedDate.map((slot) => {
                            const startTime = parseISO(slot.startTime);
                            const endTime = parseISO(slot.endTime);
                            return (
                              <Button
                                key={slot.id}
                                variant="outline"
                                className={
                                  selectedSlot?.id === slot.id
                                    ? "border-primary bg-primary/10"
                                    : ""
                                }
                                onClick={() => {
                                  setSelectedSlot(slot);
                                  setIsBookingDialogOpen(true);
                                }}
                              >
                                {format(startTime, "h:mm a")} -{" "}
                                {format(endTime, "h:mm a")}
                              </Button>
                            );
                          })}
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          <p>• Session duration: 1 hour</p>
                          <p>• Payment required after booking confirmation</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="list">
                <div className="space-y-4">
                  {availabilities.length === 0 ? (
                    <p className="text-muted-foreground">No available slots</p>
                  ) : (
                    availabilities.map((slot) => {
                      const startTime = parseISO(slot.startTime);
                      return (
                        <Card key={slot.id}>
                          <CardContent className="p-4 flex justify-between items-center">
                            <div>
                              <p className="font-medium">
                                {format(startTime, "MMMM d, yyyy")}
                              </p>
                              <p className="text-muted-foreground">
                                {format(startTime, "h:mm a")} -{" "}
                                {format(parseISO(slot.endTime), "h:mm a")}
                              </p>
                            </div>
                            <Button
                              onClick={() => {
                                setSelectedSlot(slot);
                                setIsBookingDialogOpen(true);
                              }}
                            >
                              Book
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Booking</DialogTitle>
            <DialogDescription>
              You are about to request a session with {mentor.name}
            </DialogDescription>
          </DialogHeader>
          {selectedSlot && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Date</p>
                  <p className="text-sm">
                    {format(parseISO(selectedSlot.startTime), "MMMM d, yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Time</p>
                  <p className="text-sm">
                    {format(parseISO(selectedSlot.startTime), "h:mm a")} -{" "}
                    {format(parseISO(selectedSlot.endTime), "h:mm a")}
                  </p>
                </div>
              </div>
              {mentor.hourlyRate && (
                <div>
                  <p className="text-sm font-medium">Estimated Cost</p>
                  <p className="text-sm">${mentor.hourlyRate.toFixed(2)}</p>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Your request will be sent to {mentor.name} for confirmation. You
                will be notified once they respond. After confirmation, you'll
                need to complete payment to secure the session.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsBookingDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleBookSession} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Confirm Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
