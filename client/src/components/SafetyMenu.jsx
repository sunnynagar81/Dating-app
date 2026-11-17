import { useState } from "react";
import api from "../services/api";
import ReportModal from "./ReportModal";

export default function SafetyMenu({ userId, userName, matchId, onChange }) {
  const [open, setOpen] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [busy, setBusy] = useState(false);

  const unmatch = async () => {
    if (!window.confirm(`Unmatch with ${userName}? The conversation will be removed.`)) return;
    setBusy(true);
    try {
      await api.post(`/safety/unmatch/${matchId}`);
      onChange?.("unmatched");
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setBusy(false);
      setOpen(false);
    }
  };

  const block = async () => {
    if (!window.confirm(`Block ${userName}? You will not see each other anymore.`)) return;
    setBusy(true);
    try {
      await api.post(`/safety/block/${userId}`);
      onChange?.("blocked");
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setBusy(false);
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label="More options"
        className="flex h-10 w-10 items-center justify-center rounded-full text-xl text-ink transition hover:bg-line"
      >
        ⋯
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-52 overflow-hidden rounded-2xl border border-line bg-white shadow-xl">
          {matchId && (
            <button
              onClick={unmatch}
              disabled={busy}
              className="block w-full px-4 py-3 text-left text-sm transition hover:bg-paper"
            >
              Unmatch
            </button>
          )}
          <button
            onClick={() => {
              setOpen(false);
              setShowReport(true);
            }}
            className="block w-full px-4 py-3 text-left text-sm text-accent transition hover:bg-paper"
          >
            Report
          </button>
          <button
            onClick={block}
            disabled={busy}
            className="block w-full px-4 py-3 text-left text-sm text-accent transition hover:bg-paper"
          >
            Block
          </button>
        </div>
      )}

      {showReport && (
        <ReportModal
          userId={userId}
          userName={userName}
          onClose={() => setShowReport(false)}
          onDone={() => {
            setShowReport(false);
            onChange?.("reported");
          }}
        />
      )}
    </div>
  );
}