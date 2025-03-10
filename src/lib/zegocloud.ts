import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

// ZegoCloud configuration
const appID = 1126046936; // Using the value from .env directly
const serverSecret = "e1b6924de815c923dd651d577eae57c2"; // Using the value from .env directly

/**
 * Generate a token for ZegoCloud
 * @param roomID The room ID for the call
 * @param userID The user's ID
 * @param userName The user's display name
 * @returns A token for ZegoCloud
 */
export function generateToken(
  roomID: string,
  userID: string,
  userName: string,
) {
  if (!appID || !serverSecret) {
    console.error("ZegoCloud App ID or Server Secret is missing");
    return null;
  }

  return ZegoUIKitPrebuilt.generateKitTokenForTest(
    appID,
    serverSecret,
    roomID,
    userID,
    userName,
  );
}

/**
 * Create a ZegoCloud call instance
 * @param element The DOM element to render the call in
 * @param roomID The room ID for the call
 * @param userID The user's ID
 * @param userName The user's display name
 * @param onCallEnd Callback when the call ends
 * @returns The ZegoCloud call instance
 */
export function createZegoCall(
  element: HTMLDivElement,
  roomID: string,
  userID: string,
  userName: string,
  onCallEnd?: () => void,
) {
  const kitToken = generateToken(roomID, userID, userName);
  if (!kitToken) {
    console.error("Failed to generate ZegoCloud token");
    return null;
  }

  try {
    // Create instance
    const zp = ZegoUIKitPrebuilt.create(kitToken);

    // Join the call
    zp.joinRoom({
      container: element,
      scenario: {
        mode: ZegoUIKitPrebuilt.OneONoneCall,
      },
      showScreenSharingButton: true,
      showPreJoinView: false,
      turnOnMicrophoneWhenJoining: true,
      turnOnCameraWhenJoining: true,
      showMyCameraToggleButton: true,
      showMyMicrophoneToggleButton: true,
      showUserList: true,
      showTextChat: true,
      showRoomDetailsButton: true,
      onLeaveRoom: onCallEnd,
    });

    console.log("ZegoCloud call created successfully");
    return zp;
  } catch (error) {
    console.error("Error creating ZegoCloud call:", error);
    return null;
  }
}
