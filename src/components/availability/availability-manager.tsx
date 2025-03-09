import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getMentorAvailability, addAvailability } from "@/lib/api";
import { Availability } from "@/types";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  format,
  addHours,
  parseISO,
  isSameDay,
  startOfDay,
  endOfDay,
} from "date-fns";

export function AvailabilityManager() {
  const { user } = useAuth();
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAvailability();
    }
  }, [user]);

  const fetchAvailability = async () => {
    try {
      setIsLoading(true);
      if (user) {
        const data = await getMentorAvailability(user.id);
        setAvailabilities(data);
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAvailability = async () => {
    if (!user || !selectedDate) return;

    try {
      setIsSubmitting(true);

      const date = selectedDate;
      const [startHour, startMinute] = startTime.split(":").map(Number);
      const [endHour, endMinute] = endTime.split(":").map(Number);

      const startDateTime = new Date(date);
      startDateTime.setHours(startHour, startMinute, 0, 0);

      const endDateTime = new Date(date);
      endDateTime.setHours(endHour, endMinute, 0, 0);

      await addAvailability({
        mentorId: user.id,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        isBooked: false,
      });

      await fetchAvailability();
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Error adding availability:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableSlotsForSelectedDate = availabilities.filter(
    (slot) => selectedDate && isSameDay(parseISO(slot.startTime), selectedDate),
  );

  const timeSlots = [];
  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 60; j += 30) {
      const hour = i.toString().padStart(2, "0");
      const minute = j.toString().padStart(2, "0");
      timeSlots.push(`${hour}:${minute}`);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Manage Availability
        </h2>
        <p className="text-muted-foreground">
          Set your available time slots for mentoring sessions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Availability</CardTitle>
          <CardDescription>
            Select dates and add time slots when you're available for mentoring
          </CardDescription>
        </CardHeader>
        <CardContent>
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
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">
                  Slots for{" "}
                  {selectedDate
                    ? format(selectedDate, "MMMM d, yyyy")
                    : "Selected Date"}
                </h3>
                <Dialog
                  open={isAddDialogOpen}
                  onOpenChange={setIsAddDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button>Add Slot</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Availability</DialogTitle>
                      <DialogDescription>
                        Add a new time slot for{" "}
                        {selectedDate
                          ? format(selectedDate, "MMMM d, yyyy")
                          : "the selected date"}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Start Time
                          </label>
                          <Select
                            value={startTime}
                            onValueChange={setStartTime}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select start time" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeSlots.map((time) => (
                                <SelectItem key={`start-${time}`} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            End Time
                          </label>
                          <Select value={endTime} onValueChange={setEndTime}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select end time" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeSlots.map((time) => (
                                <SelectItem key={`end-${time}`} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsAddDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddAvailability}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Adding..." : "Add Slot"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">Loading...</div>
              ) : availableSlotsForSelectedDate.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No slots available for this date. Add some slots!
                </div>
              ) : (
                <div className="space-y-2">
                  {availableSlotsForSelectedDate.map((slot) => {
                    const startTime = parseISO(slot.startTime);
                    const endTime = parseISO(slot.endTime);
                    return (
                      <Card key={slot.id}>
                        <CardContent className="p-4 flex justify-between items-center">
                          <div>
                            <p className="font-medium">
                              {format(startTime, "h:mm a")} -{" "}
                              {format(endTime, "h:mm a")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {slot.isBooked ? "Booked" : "Available"}
                            </p>
                          </div>
                          {!slot.isBooked && (
                            <Button variant="outline" size="sm">
                              Remove
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button variant="outline">Save Changes</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
