import { useEffect, useRef, useState } from "react";

const MicIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-7 w-7">
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
  </svg>
);

export default function VoiceRecorder({
  minSeconds = 1,
  maxSeconds = 60,
  onRecorded,
  disabled,
  hint = "Tap to record",
}) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const secondsRef = useRef(0);

  const stop = () => {
    clearInterval(timerRef.current);
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    setRecording(false);
  };

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];
      secondsRef.current = 0;
      setSeconds(0);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const duration = secondsRef.current;
        if (duration < minSeconds) {
          alert(`Please record at least ${minSeconds} seconds`);
          return;
        }
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        onRecorded(blob, duration);
      };

      recorder.start();
      setRecording(true);

      timerRef.current = setInterval(() => {
        secondsRef.current += 1;
        setSeconds(secondsRef.current);
        if (secondsRef.current >= maxSeconds) stop();
      }, 1000);
    } catch (err) {
      alert("Microphone access is not available: " + err.message);
    }
  };

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      if (recorderRef.current) {
        recorderRef.current.onstop = null;
        if (recorderRef.current.state !== "inactive") recorderRef.current.stop();
      }
    };
  }, []);

  const progress = Math.min(100, (seconds / maxSeconds) * 100);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative flex items-center justify-center">
        {recording && (
          <span className="absolute h-24 w-24 animate-ping rounded-full bg-accent/20" />
        )}
        <button
          onClick={recording ? stop : start}
          disabled={disabled}
          aria-label={recording ? "Stop recording" : "Start recording"}
          className={`relative flex h-18 w-18 items-center justify-center rounded-full text-white shadow-xl transition duration-300 hover:scale-105 active:scale-95 disabled:opacity-40 ${
            recording
              ? "bg-ink shadow-ink/30"
              : "bg-gradient-to-br from-accent to-[#7d0f33] shadow-accent/30"
          }`}
          style={{ height: "4.5rem", width: "4.5rem" }}
        >
          {recording ? (
            <span className="h-6 w-6 rounded-md bg-white" />
          ) : (
            <MicIcon />
          )}
        </button>
      </div>

      {recording ? (
        <div className="flex w-full max-w-[220px] flex-col items-center gap-2">
          <div className="h-1 w-full overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-accent transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm tabular-nums text-muted">
            {seconds}s / {maxSeconds}s · tap to stop
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted">{hint}</p>
      )}
    </div>
  );
}