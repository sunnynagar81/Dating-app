import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const inputClass =
  "w-full rounded-2xl border border-line bg-white px-4 py-3.5 text-ink shadow-sm placeholder:text-muted/70 transition focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10";

function ProfilePhoto({ userId, hasPhoto, name, version }) {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    if (!hasPhoto) {
      setSrc(null);
      return;
    }
    let objectUrl;
    api
      .get(`/photo/${userId}`, { responseType: "blob" })
      .then((res) => {
        objectUrl = URL.createObjectURL(res.data);
        setSrc(objectUrl);
      })
      .catch(() => setSrc(null));
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [userId, hasPhoto, version]);

  if (src) {
    return <img src={src} alt={name} className="h-40 w-40 rounded-3xl object-cover shadow-lg" />;
  }
  return (
    <div className="flex h-40 w-40 items-center justify-center rounded-3xl bg-gradient-to-br from-accent to-[#7d0f33] font-display text-6xl text-white shadow-lg">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    name: user.name || "",
    age: user.age ?? "",
    gender: user.gender || "male",
    bio: user.bio || "",
  });
  const [hasPhoto, setHasPhoto] = useState(Boolean(user.hasPhoto));
  const [photoVersion, setPhotoVersion] = useState(0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Server se latest profile lo, taaki hasPhoto aur bio sahi ho
  useEffect(() => {
    api
      .get("/auth/me")
      .then(({ data }) => {
        updateUser(data.user);
        setHasPhoto(data.user.hasPhoto);
        setForm({
          name: data.user.name || "",
          age: data.user.age ?? "",
          gender: data.user.gender || "male",
          bio: data.user.bio || "",
        });
      })
      .catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const { data } = await api.put("/auth/me", { ...form, age: Number(form.age) });
      updateUser(data.user);
      setMessage({ type: "success", text: "Profile saved" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || err.message });
    } finally {
      setSaving(false);
    }
  };

  const uploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("photo", file);
    setMessage({ type: "", text: "" });
    try {
      await api.post("/photo", fd);
      setHasPhoto(true);
      setPhotoVersion((v) => v + 1);
      setMessage({ type: "success", text: "Photo updated" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || err.message });
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-20 border-b border-line/70 bg-paper/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center justify-between px-5 py-4">
          <Link to="/home" className="text-sm font-semibold text-muted transition hover:text-ink">
            ← Back
          </Link>
          <button onClick={handleLogout} className="text-sm font-semibold text-accent">
            Log out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-md px-5 pb-20 pt-8">
        <div className="animate-fade-up flex flex-col items-center">
          <ProfilePhoto
            userId={user.id}
            hasPhoto={hasPhoto}
            name={form.name || "U"}
            version={photoVersion}
          />
          <button
            onClick={() => fileRef.current.click()}
            className="mt-5 rounded-full border border-line bg-white px-5 py-2 text-sm font-semibold transition hover:border-ink"
          >
            {hasPhoto ? "Change photo" : "Add photo"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={uploadPhoto}
            className="hidden"
          />
          <p className="mt-2 text-xs text-muted">Your photo stays hidden until you connect.</p>
        </div>

        <form onSubmit={save} className="mt-10 flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Name</label>
            <input name="name" value={form.name} onChange={handleChange} className={inputClass} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Age</label>
              <input name="age" type="number" min="18" value={form.age} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange} className={inputClass}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Bio</label>
            <textarea
              name="bio"
              rows={4}
              maxLength={300}
              value={form.bio}
              onChange={handleChange}
              className={inputClass}
              placeholder="A line about you"
            />
            <p className="mt-1 text-right text-xs text-muted">{form.bio.length}/300</p>
          </div>

          {message.text && (
            <p
              className={`rounded-2xl px-4 py-3 text-sm ${
                message.type === "success"
                  ? "bg-green-50 text-green-700"
                  : "border border-red-100 bg-red-50 text-red-700"
              }`}
            >
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="mt-2 w-full rounded-2xl bg-ink py-3.5 font-semibold text-paper shadow-xl shadow-ink/15 transition hover:bg-ink/90 active:scale-[0.98] disabled:opacity-40"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      </main>
    </div>
  );
}