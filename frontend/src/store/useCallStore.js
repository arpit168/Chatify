import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import toast from "react-hot-toast";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:global.stun.twilio.com:3478" },
  ],
};

export const useCallStore = create((set, get) => ({
  callState: "idle", // "idle" | "calling" | "incoming" | "connected"
  callType: "video", // "audio" | "video"
  incomingCall: null, // { from, name, profilePic, signal, callType }
  activePartner: null, // { _id, fullName, profilePic }
  localStream: null,
  remoteStream: null,
  peerConnection: null,
  isMicMuted: false,
  isCameraOff: false,

  initCallListeners: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("callUser");
    socket.off("callAccepted");
    socket.off("callEnded");
    socket.off("callRejected");
    socket.off("iceCandidate");

    socket.on("callUser", (data) => {
      // If already in a call, automatically reject or ignore
      if (get().callState !== "idle") {
        socket.emit("rejectCall", { to: data.from });
        return;
      }
      set({
        incomingCall: data,
        callState: "incoming",
        callType: data.callType || "video",
        activePartner: {
          _id: data.from,
          fullName: data.name || "User",
          profilePic: data.profilePic || "/avatar.png",
        },
      });
    });

    socket.on("callAccepted", async (signal) => {
      const pc = get().peerConnection;
      if (pc && pc.signalingState !== "closed") {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(signal));
          set({ callState: "connected" });
        } catch (e) {
          console.error("Error setting remote desc on answer:", e);
        }
      }
    });

    socket.on("callEnded", () => {
      toast("Call ended by partner");
      get().cleanupCall();
    });

    socket.on("callRejected", () => {
      toast("Partner declined call");
      get().cleanupCall();
    });

    socket.on("iceCandidate", async (candidate) => {
      const pc = get().peerConnection;
      if (pc && pc.remoteDescription && candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error("Error adding ice candidate:", e);
        }
      }
    });
  },

  startCall: async (partner, type = "video") => {
    const socket = useAuthStore.getState().socket;
    const authUser = useAuthStore.getState().authUser;
    if (!socket || !authUser || !partner) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === "video",
        audio: true,
      });

      const pc = new RTCPeerConnection(ICE_SERVERS);
      const remote = new MediaStream();

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        event.streams[0]?.getTracks().forEach((track) => remote.addTrack(track));
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("iceCandidate", { to: partner._id, candidate: event.candidate });
        }
      };

      set({
        localStream: stream,
        remoteStream: remote,
        peerConnection: pc,
        callState: "calling",
        callType: type,
        activePartner: partner,
        isMicMuted: false,
        isCameraOff: type !== "video",
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("callUser", {
        userToCall: partner._id,
        signalData: offer,
        from: authUser._id,
        name: authUser.fullName,
        profilePic: authUser.profilePic,
        callType: type,
      });
    } catch (error) {
      console.error("Failed to start media:", error);
      toast.error("Could not access camera/microphone");
      get().cleanupCall();
    }
  },

  answerCall: async () => {
    const socket = useAuthStore.getState().socket;
    const { incomingCall, activePartner, callType } = get();
    if (!incomingCall || !socket || !activePartner) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: callType === "video",
        audio: true,
      });

      const pc = new RTCPeerConnection(ICE_SERVERS);
      const remote = new MediaStream();

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        event.streams[0]?.getTracks().forEach((track) => remote.addTrack(track));
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("iceCandidate", { to: activePartner._id, candidate: event.candidate });
        }
      };

      await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.signal));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      set({
        localStream: stream,
        remoteStream: remote,
        peerConnection: pc,
        callState: "connected",
        incomingCall: null,
        isMicMuted: false,
        isCameraOff: callType !== "video",
      });

      socket.emit("answerCall", { to: activePartner._id, signal: answer });
    } catch (error) {
      console.error("Failed to answer call:", error);
      toast.error("Could not access media devices");
      get().rejectCall();
    }
  },

  rejectCall: () => {
    const socket = useAuthStore.getState().socket;
    const { incomingCall, activePartner } = get();
    const partnerId = incomingCall?.from || activePartner?._id;
    if (socket && partnerId) {
      socket.emit("rejectCall", { to: partnerId });
    }
    get().cleanupCall();
  },

  endCall: () => {
    const socket = useAuthStore.getState().socket;
    const { activePartner } = get();
    if (socket && activePartner?._id) {
      socket.emit("endCall", { to: activePartner._id });
    }
    get().cleanupCall();
  },

  cleanupCall: () => {
    const { localStream, peerConnection } = get();
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (peerConnection) {
      peerConnection.close();
    }
    set({
      callState: "idle",
      incomingCall: null,
      activePartner: null,
      localStream: null,
      remoteStream: null,
      peerConnection: null,
      isMicMuted: false,
      isCameraOff: false,
    });
  },

  toggleMic: () => {
    const { localStream, isMicMuted } = get();
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = isMicMuted;
      });
      set({ isMicMuted: !isMicMuted });
    }
  },

  toggleCamera: () => {
    const { localStream, isCameraOff } = get();
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = isCameraOff;
      });
      set({ isCameraOff: !isCameraOff });
    }
  },
}));
