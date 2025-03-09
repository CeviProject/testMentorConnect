import { StreamVideoClient } from "@stream-io/video-react-sdk";

// Stream.io API configuration
const apiKey = import.meta.env.VITE_STREAM_API_KEY || "your_stream_api_key";

/**
 * Initialize a Stream Video client for a user
 * @param userId The user's ID
 * @param userName The user's display name
 * @param userImage The user's avatar URL
 * @param token The user's Stream token
 * @returns A StreamVideoClient instance
 */
export const initStreamClient = (
  userId: string,
  userName: string,
  userImage?: string,
  token?: string,
) => {
  // In a real app, you would generate this token on your backend
  // For demo purposes, we're using a client-side token
  const demoToken = token || generateDemoToken(userId);

  return new StreamVideoClient({
    apiKey,
    user: {
      id: userId,
      name: userName,
      image: userImage,
    },
    token: demoToken,
  });
};

/**
 * Generate a demo token for testing purposes
 * In production, tokens should be generated on the server
 */
const generateDemoToken = (userId: string) => {
  // For development purposes only - in production, generate this on your backend
  try {
    // This is a simplified token generation for demo purposes
    // In production, use a proper server-side implementation
    const timestamp = Math.floor(Date.now() / 1000);
    const expiresAt = timestamp + 60 * 60; // 1 hour from now

    return `${userId}_${expiresAt}_demo_token`;
  } catch (error) {
    console.error("Error generating demo token:", error);
    return `demo_token_for_${userId}`;
  }
};

/**
 * Create or join a call
 * @param client The StreamVideoClient instance
 * @param callId The unique ID for the call
 * @param callData Additional data for the call
 * @returns The call object
 */
export const createOrJoinCall = async (
  client: StreamVideoClient,
  callId: string,
  callData?: any,
) => {
  const callType = "default";
  const call = client.call(callType, callId);

  await call.getOrCreate({
    ring: true,
    data: callData,
  });

  return call;
};
