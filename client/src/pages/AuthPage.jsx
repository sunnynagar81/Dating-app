import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const BAR_HEIGHTS = [38, 62, 46, 80, 58, 90, 34, 70, 52, 96, 44, 66, 28, 84, 56, 74, 40, 92, 36, 60, 78, 48, 88, 30, 64, 42, 82, 54, 68, 26];

const inputClass =
  "w-full rounded-2xl border border-line bg-white px-4 py-3.5 text-ink shadow-sm placeholder:text-muted/70 transition focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10";

function Waveform() {
  return (
    <div className="flex h-40 items-center gap-[6px]">
      {BAR_HEIGHTS.map((h, i) => (
        <span
          key={i}
          className="w-[6px] origin-center animate-pulse rounded-full bg-gradient-to-t from-accent to-[#e0587f]"
          style={{
            height: `${h}%`,
            animationDelay: `${i * 90}ms`,
            animationDuration: "2.4s",
          }}
        />
      ))}
    </div>
  );
}

export default function AuthPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    password: "",
    age: "",
    gender: "male",
    bio: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(form.phone, form.password);
      } else {
        await register({ ...form, age: Number(form.age) });
      }
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-paper md:grid-cols-2">
      {/* Left panel: sirf desktop par */}
      <aside className="relative hidden overflow-hidden bg-ink p-12 text-paper md:flex md:flex-col md:justify-between">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-accent/25 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-[#7d0f33]/40 blur-3xl" />

        <p className="relative font-display text-2xl font-semibold tracking-tight">Echo</p>

        <div className="relative">
          <h2 className="font-display text-5xl leading-[1.1] tracking-tight">
            Fall for the voice <span className="italic text-[#f0a3bd]">before</span> the face.
          </h2>
          <div className="mt-10">
            <Waveform />
          </div>
        </div>

        <p className="relative text-sm text-paper/60">
          Photos stay hidden until you truly connect.
        </p>
      </aside>

      {/* Right panel: form */}
      <main className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-fade-up">
          <p className="font-display text-2xl font-semibold tracking-tight md:hidden">Echo</p>

          <h1 className="mt-6 font-display text-4xl tracking-tight text-ink">
            {mode === "login" ? "Welcome back." : "Create your profile."}
          </h1>
          <p className="mt-3 text-muted">
            {mode === "login"
              ? "Log in to continue your conversations."
              : "Your voice comes first. Your photo comes later."}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3">
            {mode === "register" && (
              <>
                <input name="name" placeholder="Name" value={form.name} onChange={handleChange} className={inputClass} required />
                <div className="grid grid-cols-2 gap-3">
                  <input name="age" type="number" placeholder="Age" value={form.age} onChange={handleChange} className={inputClass} required />
                  <select name="gender" value={form.gender} onChange={handleChange} className={inputClass}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <input name="bio" placeholder="A line about you" value={form.bio} onChange={handleChange} className={inputClass} />
              </>
            )}

            <input name="phone" placeholder="Phone number" value={form.phone} onChange={handleChange} className={inputClass} required />
            <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} className={inputClass} required />

            {error && (
              <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-3 w-full rounded-2xl bg-ink py-4 font-semibold text-paper shadow-xl shadow-ink/15 transition hover:bg-ink/90 active:scale-[0.98] disabled:opacity-40"
            >
              {loading ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
            </button>
          </form>

          <button
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="mt-8 w-full text-center text-sm text-muted transition hover:text-ink"
          >
            {mode === "login" ? "New here? " : "Already have an account? "}
            <span className="font-semibold text-accent underline-offset-4 hover:underline">
              {mode === "login" ? "Create an account" : "Log in"}
            </span>
          </button>
        </div>
      </main>
    </div>
  );
}