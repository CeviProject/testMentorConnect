import { supabase } from "./supabase";
import {
  Availability,
  Session,
  Notification,
  User,
  MentorProfile,
} from "@/types";

// Mentor APIs
export async function getMentors(domain?: string) {
  try {
    // Use the get_available_mentors function to get mentors with availability count
    let data;
    let error;

    try {
      const result = await supabase.rpc("get_available_mentors", {
        domain_filter: domain || null,
      });
      data = result.data;
      error = result.error;
    } catch (rpcError) {
      console.error("RPC error:", rpcError);
      error = rpcError;
    }

    if (error || !data) {
      console.error("Error using get_available_mentors RPC:", error);

      // Fallback to regular query if RPC fails
      let query = supabase
        .from("profiles")
        .select(
          `
          id,
          email,
          name,
          role,
          avatar_url,
          bio,
          domains,
          mentor_profiles(*)
        `,
        )
        .eq("role", "mentor");

      if (domain && domain !== "all") {
        query = query.filter("mentor_profiles.domains", "cs", `{${domain}}`);
      }

      const { data: fallbackData, error: fallbackError } = await query;
      if (fallbackError) throw fallbackError;

      return fallbackData.map((profile) => {
        const mentorProfile = profile.mentor_profiles?.[0] || {};
        return {
          id: profile.id,
          email: profile.email || "",
          name: profile.name,
          role: "mentor" as const,
          avatar: profile.avatar_url,
          bio: mentorProfile.bio || "",
          domains: mentorProfile.domains || [],
          hourlyRate: mentorProfile.hourly_rate || 0,
          experienceYears: mentorProfile.experience_years || 0,
          availabilityCount: 0,
        };
      });
    }

    // Map the RPC results to the expected format
    return data.map((mentor) => ({
      id: mentor.mentor_id,
      email: mentor.email || "",
      name: mentor.name,
      role: "mentor" as const,
      avatar: mentor.avatar_url,
      bio: mentor.bio || "",
      domains: mentor.domains || [],
      hourlyRate: mentor.hourly_rate || 0,
      experienceYears: mentor.experience_years || 0,
      availabilityCount: mentor.availability_count || 0,
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
      .select(
        `
        id,
        email,
        name,
        role,
        avatar_url,
        mentor_profiles(*)
      `,
      )
      .eq("id", id)
      .eq("role", "mentor")
      .single();

    if (error) throw error;

    const mentorProfile = data.mentor_profiles?.[0] || {};

    return {
      id: data.id,
      email: data.email || "",
      name: data.name,
      role: "mentor",
      avatar: data.avatar_url,
      bio: mentorProfile.bio || "",
      domains: mentorProfile.domains || [],
      hourlyRate: mentorProfile.hourly_rate || 0,
      experienceYears: mentorProfile.experience_years || 0,
    };
  } catch (error) {
    console.error("Error getting mentor:", error);
    return null;
  }
}

export async function getSessionById(id: string): Promise<Session | null> {
  try {
    const { data, error } = await supabase
      .from("sessions")
      .select(
        `
        *,
        video_calls(*),
        payments(*)
      `,
      )
      .eq("id", id)
      .single();

    if (error) throw error;

    const videoCall = data.video_calls?.[0] || {};
    const payment = data.payments?.[0] || {};

    return {
      id: data.id,
      mentorId: data.mentor_id,
      menteeId: data.mentee_id,
      startTime: data.start_time,
      endTime: data.end_time,
      status: data.status,
      paymentStatus: data.payment_status,
      notes: data.notes,
      transcript: data.transcript,
      videoCallId: videoCall.stream_call_id,
      videoCallStatus: videoCall.status,
      recordingUrl: videoCall.recording_url,
      paymentAmount: payment.amount,
      paymentMethod: payment.payment_method,
      transactionId: payment.transaction_id,
    };
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

// Mentor Profile APIs
export async function getMentorProfile(
  mentorId: string,
): Promise<MentorProfile | null> {
  try {
    const { data, error } = await supabase
      .from("mentor_profiles")
      .select("*")
      .eq("id", mentorId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Record not found, return null
        return null;
      }
      throw error;
    }

    return {
      id: data.id,
      bio: data.bio,
      domains: data.domains,
      experienceYears: data.experience_years,
      hourlyRate: data.hourly_rate,
      availabilityHours: data.availability_hours,
      education: data.education,
      company: data.company,
      position: data.position,
      languages: data.languages,
      socialLinks: data.social_links,
    };
  } catch (error) {
    console.error("Error getting mentor profile:", error);
    return null;
  }
}

export async function updateMentorProfile(
  mentorId: string,
  profile: Partial<MentorProfile>,
) {
  try {
    // Check if profile exists
    const existingProfile = await getMentorProfile(mentorId);

    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from("mentor_profiles")
        .update({
          bio: profile.bio,
          domains: profile.domains,
          experience_years: profile.experienceYears,
          hourly_rate: profile.hourlyRate,
          availability_hours: profile.availabilityHours,
          education: profile.education,
          company: profile.company,
          position: profile.position,
          languages: profile.languages,
          social_links: profile.socialLinks,
          updated_at: new Date().toISOString(),
        })
        .eq("id", mentorId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from("mentor_profiles")
        .insert({
          id: mentorId,
          bio: profile.bio,
          domains: profile.domains,
          experience_years: profile.experienceYears,
          hourly_rate: profile.hourlyRate,
          availability_hours: profile.availabilityHours,
          education: profile.education,
          company: profile.company,
          position: profile.position,
          languages: profile.languages,
          social_links: profile.socialLinks,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error("Error updating mentor profile:", error);
    throw error;
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
      .eq("mentor_id", mentorId)
      .order("start_time", { ascending: true });

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

export async function deleteAvailability(availabilityId: string) {
  try {
    const { error } = await supabase
      .from("availabilities")
      .delete()
      .eq("id", availabilityId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting availability:", error);
    throw error;
  }
}

// Session APIs
export async function requestSession(
  session: Omit<
    Session,
    | "id"
    | "status"
    | "paymentStatus"
    | "notes"
    | "transcript"
    | "videoCallId"
    | "videoCallStatus"
    | "recordingUrl"
    | "paymentAmount"
    | "paymentMethod"
    | "transactionId"
  >,
) {
  try {
    // Start a transaction
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
      .select(
        `
        *,
        video_calls(*),
        payments(*)
      `,
      )
      .eq(field, userId)
      .order("start_time", { ascending: false });

    if (error) throw error;

    return data.map((session) => {
      const videoCall = session.video_calls?.[0] || {};
      const payment = session.payments?.[0] || {};

      return {
        id: session.id,
        mentorId: session.mentor_id,
        menteeId: session.mentee_id,
        startTime: session.start_time,
        endTime: session.end_time,
        status: session.status,
        paymentStatus: session.payment_status,
        notes: session.notes,
        transcript: session.transcript,
        videoCallId: videoCall.stream_call_id,
        videoCallStatus: videoCall.status,
        recordingUrl: videoCall.recording_url,
        paymentAmount: payment.amount,
        paymentMethod: payment.payment_method,
        transactionId: payment.transaction_id,
      };
    });
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

// Payment APIs
export async function createPayment(
  sessionId: string,
  amount: number,
  paymentMethod: string,
) {
  try {
    // Create payment record
    const { data, error } = await supabase
      .from("payments")
      .insert({
        session_id: sessionId,
        amount,
        payment_method: paymentMethod,
        status: "completed",
        transaction_id: `txn_${Date.now()}`,
      })
      .select()
      .single();

    if (error) throw error;

    // Update session payment status
    const { error: sessionError } = await supabase
      .from("sessions")
      .update({ payment_status: "completed" })
      .eq("id", sessionId);

    if (sessionError) throw sessionError;

    return data;
  } catch (error) {
    console.error("Error creating payment:", error);
    throw error;
  }
}

// Video Call APIs
export async function createVideoCall(sessionId: string, streamCallId: string) {
  try {
    const { data, error } = await supabase
      .from("video_calls")
      .insert({
        session_id: sessionId,
        stream_call_id: streamCallId,
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating video call:", error);
    throw error;
  }
}

export async function updateVideoCallStatus(
  videoCallId: string,
  status: string,
  recordingUrl?: string,
) {
  try {
    const updateData: any = { status };
    if (recordingUrl) {
      updateData.recording_url = recordingUrl;
    }

    if (status === "started") {
      updateData.started_at = new Date().toISOString();
    } else if (status === "ended") {
      updateData.ended_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("video_calls")
      .update(updateData)
      .eq("id", videoCallId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating video call status:", error);
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
