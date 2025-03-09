import { supabase } from "./supabase";
import { Availability, Session, Notification, User } from "@/types";

// Mentor APIs
export async function getMentors(domain?: string) {
  try {
    let query = supabase.from("profiles").select("*").eq("role", "mentor");

    if (domain) {
      query = query.contains("domains", [domain]);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data.map((profile) => ({
      id: profile.id,
      email: profile.email || "",
      name: profile.name,
      role: "mentor" as const,
      avatar: profile.avatar_url,
      bio: profile.bio,
      domains: profile.domains,
      hourlyRate: profile.hourly_rate,
    }));
  } catch (error) {
    console.error("Error getting mentors:", error);
    throw error;
  }
}

export async function getMentorById(id: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .eq("role", "mentor")
      .single();

    if (error) throw error;

    return {
      id: data.id,
      email: data.email || "",
      name: data.name,
      role: "mentor",
      avatar: data.avatar_url,
      bio: data.bio,
      domains: data.domains,
      hourlyRate: data.hourly_rate,
    };
  } catch (error) {
    console.error("Error getting mentor:", error);
    return null;
  }
}

// Availability APIs
export async function getMentorAvailability(
  mentorId: string,
): Promise<Availability[]> {
  try {
    const { data, error } = await supabase
      .from("availabilities")
      .select("*")
      .eq("mentor_id", mentorId);

    if (error) throw error;

    return data.map((slot) => ({
      id: slot.id,
      mentorId: slot.mentor_id,
      startTime: slot.start_time,
      endTime: slot.end_time,
      isBooked: slot.is_booked,
    }));
  } catch (error) {
    console.error("Error getting mentor availability:", error);
    throw error;
  }
}

export async function addAvailability(availability: Omit<Availability, "id">) {
  try {
    const { data, error } = await supabase
      .from("availabilities")
      .insert({
        mentor_id: availability.mentorId,
        start_time: availability.startTime,
        end_time: availability.endTime,
        is_booked: availability.isBooked,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error adding availability:", error);
    throw error;
  }
}

// Session APIs
export async function requestSession(
  session: Omit<
    Session,
    "id" | "status" | "paymentStatus" | "notes" | "transcript"
  >,
) {
  try {
    const { data, error } = await supabase
      .from("sessions")
      .insert({
        mentor_id: session.mentorId,
        mentee_id: session.menteeId,
        start_time: session.startTime,
        end_time: session.endTime,
        status: "requested",
        payment_status: "pending",
      })
      .select()
      .single();

    if (error) throw error;

    // Create notification for mentor
    await createNotification({
      userId: session.mentorId,
      title: "New Session Request",
      message: "You have a new session request",
      type: "request",
      read: false,
      createdAt: new Date().toISOString(),
      relatedSessionId: data.id,
    });

    return data;
  } catch (error) {
    console.error("Error requesting session:", error);
    throw error;
  }
}

export async function updateSessionStatus(
  sessionId: string,
  status: Session["status"],
) {
  try {
    const { data, error } = await supabase
      .from("sessions")
      .update({ status })
      .eq("id", sessionId)
      .select()
      .single();

    if (error) throw error;

    // Create notification for mentee
    const notificationType =
      status === "confirmed" ? "confirmation" : "summary";
    const notificationTitle =
      status === "confirmed" ? "Session Confirmed" : "Session Declined";
    const notificationMessage =
      status === "confirmed"
        ? "Your session has been confirmed"
        : "Your session request was declined";

    await createNotification({
      userId: data.mentee_id,
      title: notificationTitle,
      message: notificationMessage,
      type: notificationType,
      read: false,
      createdAt: new Date().toISOString(),
      relatedSessionId: sessionId,
    });

    return data;
  } catch (error) {
    console.error("Error updating session status:", error);
    throw error;
  }
}

export async function getUserSessions(
  userId: string,
  role: "mentor" | "mentee",
): Promise<Session[]> {
  try {
    const field = role === "mentor" ? "mentor_id" : "mentee_id";
    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .eq(field, userId);

    if (error) throw error;

    return data.map((session) => ({
      id: session.id,
      mentorId: session.mentor_id,
      menteeId: session.mentee_id,
      startTime: session.start_time,
      endTime: session.end_time,
      status: session.status,
      paymentStatus: session.payment_status,
      notes: session.notes,
      transcript: session.transcript,
    }));
  } catch (error) {
    console.error("Error getting user sessions:", error);
    throw error;
  }
}

export async function updateSessionNotes(sessionId: string, notes: string) {
  try {
    const { data, error } = await supabase
      .from("sessions")
      .update({ notes })
      .eq("id", sessionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating session notes:", error);
    throw error;
  }
}

export async function updateSessionTranscript(
  sessionId: string,
  transcript: string,
) {
  try {
    const { data, error } = await supabase
      .from("sessions")
      .update({ transcript })
      .eq("id", sessionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating session transcript:", error);
    throw error;
  }
}

// Notification APIs
export async function createNotification(
  notification: Omit<Notification, "id">,
) {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: notification.userId,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        read: notification.read,
        created_at: notification.createdAt,
        related_session_id: notification.relatedSessionId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

export async function getUserNotifications(
  userId: string,
): Promise<Notification[]> {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data.map((notification) => ({
      id: notification.id,
      userId: notification.user_id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      read: notification.read,
      createdAt: notification.created_at,
      relatedSessionId: notification.related_session_id,
    }));
  } catch (error) {
    console.error("Error getting user notifications:", error);
    throw error;
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
}
