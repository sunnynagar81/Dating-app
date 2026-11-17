import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const BARS = [38, 62, 46, 80, 58, 90, 34, 70, 52, 96, 44, 66, 28, 84, 56, 74, 40, 92, 36, 60, 78, 48, 88, 30];

const steps = [
  {
    n: "01",
    title: "Introduce yourself with your voice",
    text: "Record a short 15 to 45 second intro. Let people hear your humor, warmth and personality.",
  },
  {
    n: "02",
    title: "Find people who sound right",
    text: "Listen to intros from people nearby. Photos stay hidden, so you decide based on who they are.",
  },
  {
    n: "03",
    title: "Get to know each other",
    text: "Send voice messages and chat naturally. Five messages unlock each other's photo.",
  },
];

const features = [
  {
    title: "Judge by personality",
    text: "Connections start with how someone talks, laughs and thinks, not with a perfect picture.",
  },
  {
    title: "Your privacy comes first",
    text: "Your photo is shared only with people you have truly connected with, never with the whole app.",
  },
  {
    title: "Conversations that feel personal",
    text: "Voice messages carry tone and emotion that text cannot, and they are easy to send anytime.",
  },
  {
    title: "Matches you have earned",
    text: "Photos unlock through real conversation, so every match starts with genuine interest.",
  },
];

const Wave = () => (
  <div className="flex h-24 items-center gap-[5px]">
    {BARS.map((h, i) => (
      <span
        key={i}
        className="w-[5px] origin-center animate-pulse rounded-full bg-gradient-to-t from-accent to-[#e0587f]"
        style={{ height: `${h}%`, animationDelay: `${i * 80}ms`, animationDuration: "2.4s" }}
      />
    ))}
  </div>
);

const Eyebrow = ({ children }) => (
  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">{children}</p>
);

export default function Landing() {
  const { user } = useAuth();
  const primaryTo = user ? "/home" : "/login";

  return (
    <div className="min-h-screen bg-paper text-ink">
      <nav className="sticky top-0 z-30 border-b border-line/70 bg-paper/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="#top" className="font-display text-2xl font-semibold tracking-tight">
            Echo
          </a>
          <div className="hidden items-center gap-8 text-sm text-muted md:flex">
            <a href="#how" className="transition hover:text-ink">How it works</a>
            <a href="#features" className="transition hover:text-ink">Why Echo</a>
          </div>
          <Link
            to={primaryTo}
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-ink/90"
          >
            {user ? "Open app" : "Log in"}
          </Link>
        </div>
      </nav>

      <section id="top" className="relative overflow-hidden">
        <div className="absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute -left-40 top-64 h-96 w-96 rounded-full bg-[#7d0f33]/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-16 px-6 py-24 md:grid-cols-2 md:py-32">
          <div className="animate-fade-up">
            <Eyebrow>Voice-first dating</Eyebrow>
            <h1 className="mt-6 font-display text-5xl leading-[1.05] tracking-tight md:text-7xl">
              Fall for the voice <span className="italic text-accent">before</span> the face.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
              Echo helps you connect with people for who they really are. Start with a conversation,
              and let the photo come later.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to={primaryTo}
                className="rounded-full bg-accent px-7 py-3.5 font-semibold text-white shadow-xl shadow-accent/30 transition hover:brightness-110"
              >
                {user ? "Open app" : "Get started"}
              </Link>
              <a
                href="#how"
                className="rounded-full border border-line bg-white px-7 py-3.5 font-semibold transition hover:border-ink"
              >
                See how it works
              </a>
            </div>
          </div>

          <div className="animate-fade-up">
            <div className="rounded-[32px] border border-line bg-white p-8 shadow-[0_30px_80px_-30px_rgba(20,18,15,0.35)]">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-[#7d0f33] font-display text-xl text-white">
                  A
                </div>
                <div>
                  <p className="font-display text-xl">Sample profile</p>
                  <p className="text-sm text-muted">Voice intro preview</p>
                </div>
              </div>
              <div className="mt-6">
                <Wave />
              </div>
              <div className="mt-6 flex items-center justify-between rounded-2xl bg-paper px-5 py-4">
                <p className="text-sm text-muted">Photo hidden</p>
                <div className="flex gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={`h-2.5 w-2.5 rounded-full ${i < 3 ? "bg-accent" : "bg-line"}`} />
                  ))}
                </div>
              </div>
              <p className="mt-3 text-xs text-muted">3 of 5 voice messages to unlock</p>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-6xl px-6 py-24">
        <Eyebrow>How it works</Eyebrow>
        <h2 className="mt-4 font-display text-4xl tracking-tight md:text-5xl">
          Three simple steps to a real conversation.
        </h2>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="rounded-3xl border border-line bg-white p-8 shadow-sm">
              <p className="font-display text-5xl text-accent/30">{s.n}</p>
              <h3 className="mt-6 font-display text-2xl">{s.title}</h3>
              <p className="mt-3 leading-relaxed text-muted">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-ink py-24 text-paper">
        <div className="mx-auto grid max-w-6xl items-center gap-16 px-6 md:grid-cols-2">
          <div>
            <Eyebrow>The photo unlock</Eyebrow>
            <h2 className="mt-4 font-display text-4xl tracking-tight md:text-5xl">
              Earn the photo through conversation.
            </h2>
            <p className="mt-6 leading-relaxed text-paper/70">
              Once two people exchange five voice messages, both photos unlock at the same moment.
              No guessing, no pressure, just a genuine start.
            </p>
            <p className="mt-4 text-sm text-paper/50">
              Coming soon: a live voice call as another way to unlock photos.
            </p>
          </div>
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-10">
            <div className="flex justify-center gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-3">
                  <span
                    className={`flex h-14 w-14 items-center justify-center rounded-full font-display text-xl ${
                      i < 3 ? "bg-accent text-white" : "bg-white/10 text-paper/40"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="text-xs text-paper/50">message</span>
                </div>
              ))}
            </div>
            <p className="mt-8 text-center font-display text-2xl">Photo unlocks at five</p>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 py-24">
        <Eyebrow>Why Echo</Eyebrow>
        <h2 className="mt-4 font-display text-4xl tracking-tight md:text-5xl">
          Dating that starts with who you are.
        </h2>
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {features.map((f) => (
            <div key={f.title} className="rounded-3xl border border-line bg-white p-8 shadow-sm">
              <h3 className="font-display text-2xl">{f.title}</h3>
              <p className="mt-3 leading-relaxed text-muted">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-[32px] bg-gradient-to-br from-accent to-[#7d0f33] px-8 py-16 text-center text-white md:px-16">
          <h2 className="font-display text-4xl tracking-tight md:text-5xl">Ready to listen?</h2>
          <p className="mx-auto mt-4 max-w-md text-white/80">
            Record your intro in a minute and start meeting people who connect with your voice.
          </p>
          <Link
            to={primaryTo}
            className="mt-8 inline-block rounded-full bg-white px-8 py-3.5 font-semibold text-ink transition hover:bg-paper"
          >
            {user ? "Open app" : "Create your account"}
          </Link>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 md:flex-row">
          <p className="font-display text-xl">Echo</p>
          <p className="text-sm text-muted">Listen first. Look later.</p>
        </div>
      </footer>
    </div>
  );
}