import { useEffect, useRef } from "react";
import { Phone, PhoneOff, Video } from "lucide-react";
import { useCallStore } from "../store/useCallStore";

function IncomingCallModal() {
  const { callState, incomingCall, answerCall, rejectCall } = useCallStore();
  const ringtoneRef = useRef(null);

  useEffect(() => {
    if (callState === "incoming") {
      try {
        const audio = new Audio("/sounds/ringtone.mp3");
        audio.loop = true;
        audio.play().catch(() => {});
        ringtoneRef.current = audio;
      } catch (e) {
        console.log("Ringtone error:", e);
      }
    } else {
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current = null;
      }
    }
    return () => {
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current = null;
      }
    };
  }, [callState]);

  if (callState !== "incoming" || !incomingCall) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-indigo-500 shadow-xl bg-slate-800">
            <img
              src={incomingCall.profilePic || "/avatar.png"}
              alt={incomingCall.name || "Caller"}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -inset-2 rounded-full border-2 border-indigo-500 animate-ping pointer-events-none" />
        </div>

        <h3 className="text-xl font-bold text-white truncate max-w-full">
          {incomingCall.name || "User"}
        </h3>
        <p className="text-sm font-medium text-indigo-400 mt-1 flex items-center justify-center gap-1.5">
          {incomingCall.callType === "video" ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
          Incoming {incomingCall.callType || "video"} call...
        </p>

        <div className="flex items-center justify-center gap-6 mt-8 w-full">
          <button
            onClick={rejectCall}
            className="flex flex-col items-center gap-1.5 group"
          >
            <div className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
              <PhoneOff className="w-6 h-6" />
            </div>
            <span className="text-xs text-slate-400 font-medium">Decline</span>
          </button>

          <button
            onClick={answerCall}
            className="flex flex-col items-center gap-1.5 group"
          >
            <div className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 animate-bounce">
              <Phone className="w-6 h-6" />
            </div>
            <span className="text-xs text-slate-400 font-medium">Accept</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default IncomingCallModal;
