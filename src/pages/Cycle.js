import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function Cycle({ session }) {
  const [cycleData, setCycleData] = useState(null);
  const [periodDays, setPeriodDays] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const todayStr = today.toISOString().split("T")[0];

  useEffect(() => {
    const fetchCycle = async () => {
      const { data } = await supabase
        .from("cycle_logs")
        .select("*")
        .eq("user_id", session.user.id)
        .single();
      if (data) {
        setCycleData(data);
        setPeriodDays(data.period_days || []);
      }
    };
    fetchCycle();
  }, [session.user.id]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const monthName = today.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const toggleDay = (dayStr) => {
    setPeriodDays((prev) =>
      prev.includes(dayStr)
        ? prev.filter((d) => d !== dayStr)
        : [...prev, dayStr],
    );
  };

  const getDayStr = (day) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      user_id: session.user.id,
      period_days: periodDays,
      updated_at: new Date().toISOString(),
    };
    if (cycleData) {
      await supabase
        .from("cycle_logs")
        .update(payload)
        .eq("user_id", session.user.id);
    } else {
      await supabase.from("cycle_logs").insert([payload]);
      setCycleData(payload);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const sortedPeriod = [...periodDays].sort();
  const lastPeriodStart =
    sortedPeriod.length > 0 ? new Date(sortedPeriod[0]) : null;
  const estimatedNext = lastPeriodStart
    ? new Date(lastPeriodStart.getTime() + 35 * 24 * 60 * 60 * 1000)
    : null;
  const daysUntilNext = estimatedNext
    ? Math.ceil((estimatedNext - today) / (1000 * 60 * 60 * 24))
    : null;

  const dayHeaders = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div className="page">
      <h2 style={{ fontSize: 22, fontWeight: 500, marginBottom: 4 }}>
        Cycle tracker 🌸
      </h2>
      <p
        style={{
          fontSize: 13,
          color: "var(--text-secondary)",
          marginBottom: 20,
        }}
      >
        Tap days you had your period. PCOD often causes irregular cycles —
        that's normal.
      </p>

      <div className="cycle-legend">
        <div className="legend-item">
          <span
            className="legend-dot"
            style={{ background: "var(--pink-400)" }}
          ></span>
          Period day
        </div>
        <div className="legend-item">
          <span
            className="legend-dot"
            style={{ background: "var(--purple-400)" }}
          ></span>
          Today
        </div>
      </div>

      <div className="card">
        <p
          style={{
            fontWeight: 500,
            fontSize: 15,
            marginBottom: 14,
            color: "var(--text-primary)",
          }}
        >
          {monthName}
        </p>
        <div className="calendar-grid">
          {dayHeaders.map((d) => (
            <div key={d} className="cal-day-header">
              {d}
            </div>
          ))}
          {Array(firstDay)
            .fill(null)
            .map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
          {Array(daysInMonth)
            .fill(null)
            .map((_, i) => {
              const day = i + 1;
              const dayStr = getDayStr(day);
              const isPeriod = periodDays.includes(dayStr);
              const isToday = dayStr === todayStr;
              return (
                <div
                  key={day}
                  className={`cal-day ${isPeriod ? "period" : ""} ${isToday ? "today" : ""}`}
                  onClick={() => toggleDay(dayStr)}
                  style={{ cursor: "pointer" }}
                >
                  {day}
                </div>
              );
            })}
        </div>
        <button
          className="btn-primary"
          onClick={handleSave}
          disabled={saving}
          style={{ marginTop: 8 }}
        >
          {saving ? "Saving..." : "Save cycle data"}
        </button>
        {saved && (
          <p
            style={{
              fontSize: 13,
              color: "var(--purple-600)",
              marginTop: 8,
              textAlign: "center",
            }}
          >
            ✓ Saved!
          </p>
        )}
      </div>

      {daysUntilNext !== null && (
        <div className="cycle-info-card">
          <p className="cycle-info-title">
            {daysUntilNext > 0
              ? `Next period estimated in ~${daysUntilNext} days`
              : "Period may be due around now"}
          </p>
          <p className="cycle-info-text">
            This is an estimate based on a 35-day cycle, which is common with
            PCOD. Your actual cycle may vary — that's completely normal.
          </p>
        </div>
      )}

      <div className="card card-lavender" style={{ marginTop: 14 }}>
        <p
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "var(--purple-800)",
            marginBottom: 8,
          }}
        >
          💜 About PCOD & your cycle
        </p>
        <p
          style={{ fontSize: 13, color: "var(--purple-700)", lineHeight: 1.7 }}
        >
          PCOD can cause irregular, infrequent, or prolonged periods. Tracking
          your cycle — even when it's unpredictable — helps you spot patterns
          and have better conversations with your doctor.
        </p>
      </div>

      <div style={{ marginTop: 14 }}>
        <p className="section-title">Cycle log history</p>
        {periodDays.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            No period days logged yet. Tap dates on the calendar above.
          </p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {[...periodDays].sort().map((d) => (
              <span key={d} className="pill pill-pink">
                {new Date(d).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
