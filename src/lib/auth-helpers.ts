import { supabase } from "./supabase";

/**
 * Resend verification email to a user
 * @param email The email address to resend verification to
 */
export async function resendVerificationEmail(email: string) {
  try {
    const { data, error } = await supabase.auth.resend({
      type: "signup",
      email: email,
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error resending verification email:", error);
    return { success: false, error };
  }
}

/**
 * Reset password for a user
 * @param email The email address to send password reset to
 */
export async function resetPassword(email: string) {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error sending password reset:", error);
    return { success: false, error };
  }
}
