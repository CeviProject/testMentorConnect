import { Session, User, Availability, Notification } from "@/types";

// Mock data for storyboards
export const mockSession: Session = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  mentorId: "mentor-123",
  menteeId: "mentee-456",
  startTime: new Date().toISOString(),
  endTime: new Date(Date.now() + 3600000).toISOString(),
  status: "confirmed",
  paymentStatus: "completed",
  notes: "These are sample notes for the session.",
  transcript: "This is a sample transcript of the conversation.",
};

export const mockUser: User = {
  id: "user-123",
  email: "user@example.com",
  name: "John Doe",
  role: "mentee",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
  bio: "I'm a software developer looking to improve my skills.",
  domains: ["Software Development", "Web Development"],
  hourlyRate: 50,
};

export const mockMentor: User = {
  id: "mentor-123",
  email: "mentor@example.com",
  name: "Jane Smith",
  role: "mentor",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
  bio: "Experienced software engineer with 10+ years in the industry.",
  domains: ["Software Development", "Career Development", "Leadership"],
  hourlyRate: 75,
};
