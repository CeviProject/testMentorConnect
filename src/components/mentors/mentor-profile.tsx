import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getMentorById,
  getMentorAvailability,
  requestSession,
} from "@/lib/api";
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
      const mentorData = await getMentorById(id);
      const availabilityData = await getMentorAvailability(id);

      setMentor(mentorData);
      setAvailabilities(availabilityData.filter((slot) => !slot.isBooked));
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
      await requestSession({
        mentorId: mentor.id,
        menteeId: user.id,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
      });

      setIsBookingDialogOpen(false);
      navigate("/sessions");
    } catch (error) {
      console.error("Error booking session:", error);
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
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
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
                                  ? "border-primary"
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
                will be notified once they respond.
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
