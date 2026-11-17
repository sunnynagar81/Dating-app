import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { createSocket } from "../services/socket";
import { useAuth } from "../context/AuthContext";
import VoiceRecorder from "../components/VoiceRecorder";
import VoicePlayer from "../components/VoicePlayer";
import SafetyMenu from "../components/SafetyMenu";

const UNLOCK_TARGET = 5;

export default function Chat() {
  const { matchId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [partnerId, setPartnerId] = useState(null);
  const [partnerName, setPartnerName] = useState("");
  const [photoUnlocked, setPhotoUnlocked] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    let socket;

    const init = async () => {
      try {
        const [msgRes, matchRes] = await Promise.all([
          api.get(`/match/${matchId}/messages`),
          api.get("/match"),
        ]);
        setMessages(msgRes.data.messages);

        const current = matchRes.data.matches.find((m) => m.matchId === matchId);
        if (current) {
          setPartnerId(current.id);
          setPartnerName(current.name);
          setPhotoUnlocked(current.photoUnlocked);
        }

        socket = createSocket();
        socket.on("connect", () => socket.emit("join-match", matchId));
        socket.on("new-message", (msg) =>
          setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]))
        );
        socket.on("photo-unlocked", () => setPhotoUnlocked(true));
        socket.on("error-message", (msg) => setError(msg));
        socket.on("connect_error", (err) => setError(err.message));
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      }
    };

    init();

    return () => {
      if (socket) socket.disconnect();
    };
  }, [matchId]);

  const sendVoice = async (blob, seconds) => {
    setSending(true);
    const form = new FormData();
    form.append("audio", blob, "message.webm");
    form.append("duration", seconds);
    try {
      const { data } = await api.post(`/match/${matchId}/message`, form);
      setMessages((prev) =>
        prev.some((m) => m.id === data.message.id) ? prev : [...prev, data.message]
      );
      if (data.photoUnlocked) setPhotoUnlocked(true);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSending(false);
    }
  };

  const count = Math.min(messages.length, UNLOCK_TARGET);

  return (
    <div className="flex h-screen flex-col bg-paper">
      <header className="sticky top-0 z-20 border-b border-line/70 bg-paper/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <Link
            to="/home"
            aria-label="Back"
            className="flex h-10 w-10 items-center justify-center rounded-full text-xl text-ink transition hover:bg-line"
          >
            ←
          </Link>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-[#7d0f33] font-display text-lg text-white shadow-md">
            {partnerName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="font-display text-lg leading-tight text-ink">{partnerName || "Chat"}</p>
            <p className="text-xs text-muted">{photoUnlocked ? "Photo unlocked" : "Photo locked"}</p>
          </div>
          {partnerId && (
            <SafetyMenu
              userId={partnerId}
              userName={partnerName}
              matchId={matchId}
              onChange={() => navigate("/home")}
            />
          )}
        </div>
      </header>

      {!photoUnlocked && (
        <div className="mx-auto mt-4 w-full max-w-2xl px-4">
          <div className="flex items-center justify-between rounded-2xl border border-line bg-white px-5 py-4 shadow-sm">
            <div>
              <p className="text-sm font-semibold text-ink">Unlock their photo</p>
              <p className="text-xs text-muted">Send 5 voice messages to unlock</p>
            </div>
            <div className="flex items-center gap-2">
              {Array.from({ length: UNLOCK_TARGET }).map((_, i) => (
                <span
                  key={i}
                  className={`h-2.5 w-2.5 rounded-full transition-colors duration-500 ${
                    i < count ? "bg-accent" : "bg-line"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="mx-auto mt-3 w-full max-w-2xl px-4">
          <span className="block rounded-2xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-700">
            {error}
          </span>
        </p>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          {messages.length === 0 && (
            <div className="py-20 text-center">
              <p className="font-display text-2xl text-ink">Say hello with your voice.</p>
              <p className="mt-2 text-sm text-muted">Your first message starts the conversation.</p>
            </div>
          )}

          {messages.map((m) => {
            const mine = m.sender === user.id;
            return (
              <div key={m.id} className={`animate-fade-up flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-3xl px-4 py-3 shadow-sm ${
                    mine
                      ? "rounded-br-md bg-gradient-to-br from-accent to-[#7d0f33] text-white"
                      : "rounded-bl-md border border-line bg-white text-ink"
                  }`}
                >
                  <VoicePlayer url={m.audioUrl} isPrivate duration={m.duration} inverted={mine} />
                </div>
              </div>
            );
          })}
        </div>
        <div ref={bottomRef} />
      </div>

      <footer className="border-t border-line/70 bg-paper/80 px-5 py-6 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl justify-center">
          <VoiceRecorder
            minSeconds={1}
            maxSeconds={60}
            onRecorded={sendVoice}
            disabled={sending}
            hint={sending ? "Sending..." : "Tap to record a voice message"}
          />
        </div>
      </footer>
    </div>
  );
}