import { useState } from "react";
import api from "../services/api";

const REASONS = [
  { value: "harassment", label: "Harassment or abuse" },
  { value: "inappropriate_content", label: "Inappropriate content" },
  { value: "fake_profile", label: "Fake profile" },
  { value: "spam", label: "Spam or scam" },
  { value: "other", label: "Something else" },
];

export default function ReportModal({ userId, userName, onClose, onDone }) {
  const [reason, setReason] = useState("harassment");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.post(`/safety/report/${userId}`, { reason, details });
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md animate-fade-up rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-2xl text-ink">Report {userName}</h2>
        <p className="mt-1 text-sm text-muted">
          Our team reviews every report. This user will also be blocked for you.
        </p>

        <form onSubmit={submit} className="mt-5 flex flex-col gap-2">
          {REASONS.map((r) => (
            <label
              key={r.value}
              className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                reason === r.value ? "border-accent bg-accent/5" : "border-line"
              }`}
            >
              <input
                type="radio"
                name="reason"
                value={r.value}
                checked={reason === r.value}
                onChange={() => setReason(r.value)}
                className="accent-accent"
              />
              {r.label}
            </label>
          ))}

          <textarea
            rows={3}
            maxLength={500}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Add details (optional)"
            className="mt-2 w-full rounded-2xl border border-line px-4 py-3 text-sm focus:border-accent focus:outline-none"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="mt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-line py-3 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-2xl bg-accent py-3 font-semibold text-white disabled:opacity-40"
            >
              {submitting ? "Sending..." : "Submit report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}