import { useEffect, useRef } from "react";
import { PhoneOff, Mic, MicOff, Video, VideoOff, Volume2 } from "lucide-react";
import { useCallStore } from "../store/useCallStore";

function CallModal() {
  const {
    callState,
    callType,
    activePartner,
    localStream,
    remoteStream,
    endCall,
    toggleMic,
    toggleCamera,
    isMicMuted,
    isCameraOff,
  } = useCallStore();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, callState]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, callState]);

  if (callState !== "calling" && callState !== "connected") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl h-[75vh] bg-slate-900 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col">
        {/* Main Remote Video / Avatar Screen */}
        <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-slate-950">
          {callState === "connected" && callType === "video" ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center gap-4 z-10 animate-pulse">
              <div className="relative">
                <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-indigo-500/50 shadow-2xl bg-slate-800">
                  <img
                    src={activePartner?.profilePic || "/avatar.png"}
                    alt={activePartner?.fullName || "Partner"}
                    className="w-full h-full object-cover"
                  />
                </div>
                {callState === "calling" && (
                  <div className="absolute -inset-3 rounded-full border-2 border-indigo-500/40 animate-ping" />
                )}
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white">
                  {activePartner?.fullName || "User"}
                </h3>
                <p className="text-sm font-medium text-indigo-400 mt-1">
                  {callState === "calling" ? `Calling (${callType})...` : "Voice Connected"}
                </p>
              </div>
            </div>
          )}

          {/* Local Video Picture-in-Picture */}
          {callType === "video" && !isCameraOff && (
            <div className="absolute bottom-6 right-6 w-36 h-48 sm:w-48 sm:h-64 rounded-2xl overflow-hidden border-2 border-slate-600 shadow-2xl bg-slate-900 z-20">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            </div>
          )}
        </div>

        {/* Controls Footer */}
        <div className="h-24 bg-slate-900/90 border-t border-slate-800 flex items-center justify-center gap-6 px-6 shrink-0 z-30">
          <button
            onClick={toggleMic}
            className={`p-4 rounded-full transition-all shadow-lg ${
              isMicMuted ? "bg-red-500 text-white hover:bg-red-600" : "bg-slate-800 text-white hover:bg-slate-700"
            }`}
            title={isMicMuted ? "Unmute" : "Mute"}
          >
            {isMicMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          {callType === "video" && (
            <button
              onClick={toggleCamera}
              className={`p-4 rounded-full transition-all shadow-lg ${
                isCameraOff ? "bg-red-500 text-white hover:bg-red-600" : "bg-slate-800 text-white hover:bg-slate-700"
              }`}
              title={isCameraOff ? "Turn Camera On" : "Turn Camera Off"}
            >
              {isCameraOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
            </button>
          )}

          <button
            onClick={endCall}
            className="p-4 px-8 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-xl hover:scale-105 flex items-center gap-2"
          >
            <PhoneOff className="w-6 h-6" />
            <span className="hidden sm:inline">End Call</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default CallModal;
