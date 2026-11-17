import SafetyMenu from "../components/SafetyMenu";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import VoiceRecorder from "../components/VoiceRecorder";
import VoicePlayer from "../components/VoicePlayer";

const TABS = [
  { key: "discover", label: "Discover" },
  { key: "matches", label: "Matches" },
  { key: "intro", label: "My Intro" },
];

const initialOf = (name = "") => name.charAt(0).toUpperCase();

const cardShadow = "shadow-[0_18px_50px_-22px_rgba(20,18,15,0.28)]";
const softGradient = "bg-gradient-to-br from-[#f4d6df] via-[#fbf3ea] to-[#e6dff2]";

const Skeleton = () => (
  <div className="animate-pulse overflow-hidden rounded-[28px] border border-line bg-white">
    <div className="h-44 bg-line" />
    <div className="space-y-4 p-6">
      <div className="h-7 w-1/2 rounded-full bg-line" />
      <div className="h-4 w-3/4 rounded-full bg-line" />
      <div className="h-14 rounded-2xl bg-line" />
    </div>
  </div>
);

const EmptyState = ({ text }) => (
  <div className="rounded-[28px] border border-dashed border-line bg-white/60 px-6 py-16 text-center">
    <p className="font-display text-xl text-ink">Nothing here yet</p>
    <p className="mt-2 text-sm text-muted">{text}</p>
  </div>
);

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("discover");
  const [intro, setIntro] = useState(null);
  const [discover, setDiscover] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAll = async () => {
    try {
      const [introRes, discoverRes, matchRes] = await Promise.all([
        api.get("/voice/me").catch(() => null),
        api.get("/match/discover"),
        api.get("/match"),
      ]);
      setIntro(introRes?.data.voiceIntro || null);
      setDiscover(discoverRes.data.users);
      setMatches(matchRes.data.matches);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const uploadIntro = async (blob, seconds) => {
    const form = new FormData();
    form.append("audio", blob, "intro.webm");
    form.append("duration", seconds);
    try {
      const { data } = await api.post("/voice", form);
      setIntro(data.voiceIntro);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const connect = async (userId) => {
    try {
      const { data } = await api.post(`/match/connect/${userId}`);
      navigate(`/chat/${data.match._id}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const firstName = user.name.split(" ")[0];

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-20 border-b border-line/70 bg-paper/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center justify-between px-5 py-4">
          <p className="font-display text-2xl font-semibold tracking-tight text-ink">Echo</p>
                    <Link
            to="/profile"
            title="My profile"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-ink font-display text-base text-paper shadow-md transition hover:scale-105"
          >
            {initialOf(user.name)}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-md px-5 pb-20 pt-8">
        <div className="animate-fade-up">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Good to see you</p>
          <h1 className="mt-2 font-display text-4xl tracking-tight text-ink">Hello, {firstName}.</h1>
          <p className="mt-2 text-muted">Listen first. Look later.</p>
        </div>

        <nav className="mt-8 grid grid-cols-3 rounded-2xl border border-line bg-white p-1.5 shadow-sm">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-xl py-2.5 text-sm font-semibold transition ${
                tab === t.key ? "bg-ink text-paper shadow-md" : "text-muted hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {error && (
          <p className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-8">
          {loading && (
            <div className="flex flex-col gap-6">
              <Skeleton />
              <Skeleton />
            </div>
          )}

          {!loading && tab === "discover" && (
            <div className="flex flex-col gap-7">
              {discover.length === 0 && (
                <EmptyState text="No new people right now. Check back a little later." />
              )}
              {discover.map((u) => (
                <article
                  key={u.id}
                  className={`animate-fade-up overflow-hidden rounded-[28px] border border-line bg-white ${cardShadow}`}
                >
                  <div className={`relative flex h-44 items-center justify-center overflow-hidden ${softGradient}`}>
                    <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-white/50 blur-2xl" />
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/85 font-display text-4xl text-ink shadow-lg blur-[4px]">
                      {initialOf(u.name)}
                    </div>
                    <span className="absolute bottom-4 whitespace-nowrap rounded-full bg-ink/85 px-4 py-1.5 text-xs font-medium tracking-wide text-paper">
                      Photo hidden until you connect
                    </span>
                  </div>

                  <div className="p-6">
                      <div className="flex items-center justify-between gap-3">
                      <div className="flex items-baseline gap-3">
                        <h2 className="font-display text-3xl tracking-tight text-ink">{u.name}</h2>
                        <span className="text-lg text-muted">{u.age}</span>
                      </div>
                      <SafetyMenu userId={u.id} userName={u.name} onChange={loadAll} />
                    </div>
                    {u.bio && <p className="mt-2 leading-relaxed text-muted">{u.bio}</p>}

                    <div className="mt-5 rounded-2xl border border-line bg-paper p-4">
                      <VoicePlayer url={u.voiceIntroUrl} />
                    </div>

                    <button
                      onClick={() => connect(u.id)}
                      className="mt-5 w-full rounded-2xl bg-accent py-3.5 font-semibold text-white shadow-lg shadow-accent/25 transition hover:brightness-110 active:scale-[0.98]"
                    >
                      Connect
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {!loading && tab === "matches" && (
            <div className="flex flex-col gap-3">
              {matches.length === 0 && (
                <EmptyState text="No matches yet. Connect with someone from Discover." />
              )}
              {matches.map((m) => (
                <Link
                  key={m.matchId}
                  to={`/chat/${m.matchId}`}
                  className={`group animate-fade-up flex items-center gap-4 rounded-2xl border border-line bg-white p-4 transition hover:-translate-y-0.5 ${cardShadow}`}
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-[#7d0f33] font-display text-xl text-white">
                    {initialOf(m.name)}
                  </div>
                  <div className="flex-1">
                    <p className="font-display text-lg text-ink">{m.name}</p>
                    <span
                      className={`mt-1 inline-block rounded-full px-3 py-0.5 text-xs font-medium ${
                        m.photoUnlocked ? "bg-accent/10 text-accent" : "bg-line text-muted"
                      }`}
                    >
                      {m.photoUnlocked ? "Photo unlocked" : "Photo locked"}
                    </span>
                  </div>
                  <span className="text-xl text-muted transition group-hover:translate-x-1">→</span>
                </Link>
              ))}
            </div>
          )}

          {!loading && tab === "intro" && (
            <div className="flex flex-col gap-6">
              <section className={`animate-fade-up overflow-hidden rounded-[28px] border border-line bg-white ${cardShadow}`}>
                <div className={`p-6 ${softGradient}`}>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Your intro</p>
                  <h2 className="mt-2 font-display text-2xl text-ink">Let them hear you first.</h2>
                  <p className="mt-1 text-sm text-muted">Between 15 and 45 seconds. Be natural.</p>
                </div>
                <div className="p-6">
                  {intro ? (
                    <div className="rounded-2xl border border-line bg-paper p-4">
                      <VoicePlayer url={intro.audioUrl} duration={intro.duration} />
                    </div>
                  ) : (
                    <p className="text-sm text-muted">You have not recorded an intro yet.</p>
                  )}
                </div>
              </section>

              <section className={`flex flex-col items-center rounded-[28px] border border-line bg-white p-10 ${cardShadow}`}>
                <VoiceRecorder
                  minSeconds={15}
                  maxSeconds={45}
                  onRecorded={uploadIntro}
                  hint={intro ? "Tap to record a new intro" : "Tap to record your intro"}
                />
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}