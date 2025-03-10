export type UserRole = "mentor" | "mentee";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  domains?: string[];
  hourlyRate?: number;
  experienceYears?: number;
  availabilityCount?: number;
}

export interface MentorProfile {
  id: string;
  bio?: string;
  domains?: string[];
  experienceYears?: number;
  hourlyRate?: number;
  availabilityHours?: Record<string, string[]>;
  education?: string;
  company?: string;
  position?: string;
  languages?: string[];
  socialLinks?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    website?: string;
  };
}

export interface Availability {
  id: string;
  mentorId: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export interface Session {
  id: string;
  mentorId: string;
  menteeId: string;
  startTime: string;
  endTime: string;
  status: "requested" | "confirmed" | "declined" | "completed" | "cancelled";
  paymentStatus: "pending" | "completed" | "refunded";
  notes?: string;
  transcript?: string;
  videoCallId?: string;
  videoCallStatus?: string;
  recordingUrl?: string;
  paymentAmount?: number;
  paymentMethod?: string;
  transactionId?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "request" | "confirmation" | "reminder" | "summary" | "follow-up";
  read: boolean;
  createdAt: string;
  relatedSessionId?: string;
}
