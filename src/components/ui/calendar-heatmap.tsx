import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay, parseISO, startOfDay, endOfDay } from "date-fns";
import { Availability } from "@/types";

interface CalendarHeatmapProps {
  availabilities: Availability[];
  onDateSelect: (date: Date | undefined) => void;
}

export function CalendarHeatmap({
  availabilities,
  onDateSelect,
}: CalendarHeatmapProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [availableDates, setAvailableDates] = useState<Date[]>([]);

  useEffect(() => {
    // Extract unique dates from availabilities
    const dates = availabilities
      .filter((slot) => !slot.isBooked)
      .map((slot) => startOfDay(parseISO(slot.startTime)));

    // Remove duplicates
    const uniqueDates = dates.filter(
      (date, index, self) =>
        index === self.findIndex((d) => isSameDay(d, date)),
    );

    setAvailableDates(uniqueDates);
  }, [availabilities]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    onDateSelect(date);
  };

  // Custom day renderer to highlight days with availability
  const dayRenderer = (day: Date) => {
    const isAvailable = availableDates.some((date) => isSameDay(date, day));

    return (
      <div
        className={`relative w-full h-full p-2 ${isAvailable ? "bg-green-50" : ""}`}
      >
        <span
          className={`absolute top-1 left-1 text-xs ${isAvailable ? "font-bold text-green-700" : ""}`}
        >
          {format(day, "d")}
        </span>
        {isAvailable && (
          <div className="absolute bottom-1 right-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={handleDateSelect}
      className="rounded-md border"
      classNames={{
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
      }}
      components={{
        Day: ({ date, ...props }) => (
          <button {...props}>{dayRenderer(date)}</button>
        ),
      }}
    />
  );
}
