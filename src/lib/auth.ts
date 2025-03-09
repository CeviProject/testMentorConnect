import { supabase } from "./supabase";
import { User, UserRole } from "@/types";

export async function signUp(
  email: string,
  password: string,
  role: UserRole,
  name: string,
) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          name,
        },
      },
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;

    // Get the user profile from the profiles table
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (profileError) throw profileError;

    return {
      id: data.user.id,
      email: data.user.email || "",
      name: profileData.name || data.user.user_metadata.name || "",
      role: profileData.role || data.user.user_metadata.role || "mentee",
      avatar: profileData.avatar_url,
      bio: profileData.bio,
      domains: profileData.domains,
      hourlyRate: profileData.hourly_rate,
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function updateProfile(user: Partial<User>) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .update({
        name: user.name,
        bio: user.bio,
        domains: user.domains,
        hourly_rate: user.hourlyRate,
        avatar_url: user.avatar,
      })
      .eq("id", user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
}
