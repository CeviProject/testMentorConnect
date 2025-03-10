import { StreamVideoClient } from "@stream-io/video-react-sdk";

// Stream.io API configuration is now handled directly in the initStreamClient function

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
  // Get API key from environment variables
  const streamApiKey = import.meta.env.VITE_STREAM_API_KEY;

  // Check if we have a valid API key
  if (!streamApiKey || streamApiKey === "your_stream_api_key") {
    throw new Error("Valid Stream API key is required");
  }

  // In a real app, you would generate this token on your backend
  // For demo purposes, we're using a client-side token
  const demoToken = token || generateDemoToken(userId);

  // Create and return the Stream client
  return new StreamVideoClient({
    apiKey: streamApiKey,
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
    // Use the Stream API key from environment variables
    const apiKey = import.meta.env.VITE_STREAM_API_KEY;
    const apiSecret = import.meta.env.VITE_STREAM_SECRET;

    // If we have both key and secret, use them to generate a token
    if (apiKey && apiSecret && apiKey !== "your_stream_api_key") {
      // This is a simplified version - in production, use proper JWT signing
      const timestamp = Math.floor(Date.now() / 1000);
      const expiresAt = timestamp + 60 * 60; // 1 hour from now

      // For demo purposes, we're using a simple token format
      // In production, this should be a properly signed JWT
      return `${apiKey}_${userId}_${expiresAt}`;
    }

    // Fallback to a simple token format
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
