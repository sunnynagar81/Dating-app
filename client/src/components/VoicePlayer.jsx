import { useEffect, useMemo, useRef, useState } from "react";
import api, { API_URL } from "../services/api";

const BARS = 36;

// Har audio ke liye fixed waveform shape, URL se banta hai
const waveformFor = (seed) => {
  let h = 7;
  for (const c of String(seed)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return Array.from({ length: BARS }, () => {
    h = (h * 1103515245 + 12345) >>> 0;
    return 25 + (h % 75);
  });
};

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 translate-x-[1px] fill-current">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
    <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
  </svg>
);

// url: public intro ke liye "/uploads/..." aur private message ke liye "/api/match/messages/.../audio"
// isPrivate: true ho to file Bearer token ke saath fetch hoti hai
export default function VoicePlayer({ url, isPrivate = false, duration, inverted = false }) {
  const audioRef = useRef(null);
  const [src, setSrc] = useState(isPrivate ? null : `${API_URL}${url}`);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const heights = useMemo(() => waveformFor(url), [url]);

  useEffect(() => {
    if (!isPrivate) return;
    let objectUrl;
    api
      .get(url.replace(/^\/api/, ""), { responseType: "blob" })
      .then((res) => {
        objectUrl = URL.createObjectURL(res.data);
        setSrc(objectUrl);
      })
      .catch(() => {});
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url, isPrivate]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio || !src) return;
    if (playing) audio.pause();
    else audio.play();
  };

  const buttonClass = inverted ? "bg-white text-accent" : "bg-ink text-white";
  const filledClass = inverted ? "bg-white" : "bg-accent";
  const emptyClass = inverted ? "bg-white/35" : "bg-ink/15";
  const labelClass = inverted ? "text-white/80" : "text-muted";

  return (
    <div className="flex min-w-[230px] items-center gap-3">
      <button
        onClick={toggle}
        disabled={!src}
        aria-label={playing ? "Pause" : "Play"}
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full shadow-md transition hover:scale-105 active:scale-95 disabled:opacity-30 ${buttonClass}`}
      >
        {playing ? <PauseIcon /> : <PlayIcon />}
      </button>

      <div className="flex flex-1 flex-col gap-1">
        <div className="flex h-8 items-center gap-[3px]">
          {heights.map((h, i) => (
            <span
              key={i}
              className={`w-[3px] rounded-full transition-colors duration-200 ${
                (i / BARS) * 100 < progress ? filledClass : emptyClass
              }`}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        {duration && (
          <p className={`text-xs tabular-nums ${labelClass}`}>{duration}s</p>
        )}
      </div>

      <audio
        ref={audioRef}
        src={src || undefined}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setProgress(0);
        }}
        onTimeUpdate={(e) => {
          const a = e.currentTarget;
          if (a.duration) setProgress((a.currentTime / a.duration) * 100);
        }}
      />
    </div>
  );
}