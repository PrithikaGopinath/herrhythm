import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function Log({ session }) {
  const today = new Date().toISOString().split("T")[0];
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [alreadyLogged, setAlreadyLogged] = useState(false);

  const [mood, setMood] = useState("");
  const [sleep, setSleep] = useState(7);
  const [exercise, setExercise] = useState("none");
  const [stress, setStress] = useState(5);
  const [water, setWater] = useState(6);
  const [food, setFood] = useState("balanced");
  const [symptoms, setSymptoms] = useState([]);
  const [notes, setNotes] = useState("");

  const symptomOptions = [
    "Cramps",
    "Bloating",
    "Acne",
    "Hair loss",
    "Fatigue",
    "Mood swings",
    "Headache",
    "Irregular period",
  ];

  useEffect(() => {
    const checkToday = async () => {
      const { data } = await supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("log_date", today)
        .single();
      if (data) {
        setAlreadyLogged(true);
        setMood(data.mood || "");
        setSleep(data.sleep_hours || 7);
        setExercise(data.exercise || "none");
        setStress(data.stress_level || 5);
        setWater(data.water_glasses || 6);
        setFood(data.food_quality || "balanced");
        setSymptoms(data.symptoms || []);
        setNotes(data.notes || "");
      }
    };
    checkToday();
  }, [session.user.id, today]);

  const toggleSymptom = (s) => {
    setSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  };

  const handleSave = async () => {
    setError("");
    setSaving(true);
    const logData = {
      user_id: session.user.id,
      log_date: today,
      mood,
      sleep_hours: sleep,
      exercise,
      stress_level: stress,
      water_glasses: water,
      food_quality: food,
      symptoms,
      notes,
    };
    const { error } = alreadyLogged
      ? await supabase
          .from("daily_logs")
          .update(logData)
          .eq("user_id", session.user.id)
          .eq("log_date", today)
      : await supabase.from("daily_logs").insert([logData]);

    setSaving(false);
    if (error) setError("Could not save your log. Please try again.");
    else {
      setSaved(true);
      setAlreadyLogged(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const moods = [
    { id: "great", emoji: "😊", label: "Great" },
    { id: "okay", emoji: "😐", label: "Okay" },
    { id: "low", emoji: "😔", label: "Low" },
    { id: "rough", emoji: "😩", label: "Rough" },
  ];

  return (
    <div className="page">
      <h2 style={{ fontSize: 22, fontWeight: 500, marginBottom: 4 }}>
        Today's log
      </h2>
      <p
        style={{
          fontSize: 13,
          color: "var(--text-secondary)",
          marginBottom: 20,
        }}
      >
        {new Date().toLocaleDateString("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
      </p>

      {error && <div className="error-msg">{error}</div>}
      {saved && (
        <div className="success-msg">
          ✓ Log saved! Head to Insights to see your AI tips.
        </div>
      )}
      {alreadyLogged && !saved && (
        <div
          style={{
            background: "var(--purple-50)",
            borderRadius: "var(--radius-sm)",
            padding: "10px 14px",
            marginBottom: 14,
            fontSize: 13,
            color: "var(--purple-600)",
          }}
        >
          You've already logged today — you can update it below.
        </div>
      )}

      <div className="card">
        <p className="log-section-title">How are you feeling?</p>
        <div className="mood-grid">
          {moods.map((m) => (
            <div
              key={m.id}
              className={`mood-btn ${mood === m.id ? "selected" : ""}`}
              onClick={() => setMood(m.id)}
            >
              <span className="mood-emoji">{m.emoji}</span>
              <span className="mood-label">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <p className="log-section-title">Daily habits</p>

        <div className="log-item">
          <div className="log-item-left">
            <span className="log-item-icon">😴</span>
            <div>
              <div className="log-item-label">Sleep</div>
              <div className="log-item-sub">Hours last night</div>
            </div>
          </div>
          <div className="log-number">
            <button onClick={() => setSleep(Math.max(0, sleep - 1))}>−</button>
            <span>{sleep}h</span>
            <button onClick={() => setSleep(Math.min(12, sleep + 1))}>+</button>
          </div>
        </div>

        <div className="log-item">
          <div className="log-item-left">
            <span className="log-item-icon">🏃‍♀️</span>
            <div>
              <div className="log-item-label">Exercise</div>
              <div className="log-item-sub">Activity today</div>
            </div>
          </div>
          <select
            className="log-select"
            value={exercise}
            onChange={(e) => setExercise(e.target.value)}
          >
            <option value="none">None</option>
            <option value="walk">Walk</option>
            <option value="yoga">Yoga</option>
            <option value="gym">Gym</option>
            <option value="run">Run</option>
            <option value="dance">Dance</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="log-item">
          <div className="log-item-left">
            <span className="log-item-icon">😤</span>
            <div>
              <div className="log-item-label">Stress level</div>
              <div className="log-item-sub">1 = calm, 10 = very stressed</div>
            </div>
          </div>
          <div className="log-number">
            <button onClick={() => setStress(Math.max(1, stress - 1))}>
              −
            </button>
            <span>{stress}/10</span>
            <button onClick={() => setStress(Math.min(10, stress + 1))}>
              +
            </button>
          </div>
        </div>

        <div className="log-item">
          <div className="log-item-left">
            <span className="log-item-icon">💧</span>
            <div>
              <div className="log-item-label">Water intake</div>
              <div className="log-item-sub">Glasses of water</div>
            </div>
          </div>
          <div className="log-number">
            <button onClick={() => setWater(Math.max(0, water - 1))}>−</button>
            <span>{water}</span>
            <button onClick={() => setWater(Math.min(20, water + 1))}>+</button>
          </div>
        </div>

        <div className="log-item">
          <div className="log-item-left">
            <span className="log-item-icon">🥗</span>
            <div>
              <div className="log-item-label">Food today</div>
              <div className="log-item-sub">Overall quality</div>
            </div>
          </div>
          <select
            className="log-select"
            value={food}
            onChange={(e) => setFood(e.target.value)}
          >
            <option value="very_healthy">Very healthy</option>
            <option value="balanced">Balanced</option>
            <option value="moderate">Moderate</option>
            <option value="unhealthy">Unhealthy</option>
            <option value="skipped_meals">Skipped meals</option>
          </select>
        </div>
      </div>

      <div className="card">
        <p className="log-section-title">Symptoms today</p>
        <p
          style={{
            fontSize: 13,
            color: "var(--text-secondary)",
            marginBottom: 12,
          }}
        >
          Tap all that apply
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {symptomOptions.map((s) => (
            <div
              key={s}
              onClick={() => toggleSymptom(s)}
              style={{
                padding: "7px 14px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: symptoms.includes(s) ? 500 : 400,
                background: symptoms.includes(s)
                  ? "var(--pink-50)"
                  : "var(--bg-secondary)",
                color: symptoms.includes(s)
                  ? "var(--pink-600)"
                  : "var(--text-secondary)",
                border: `1.5px solid ${symptoms.includes(s) ? "var(--pink-100)" : "var(--border)"}`,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {s}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <p className="log-section-title">Notes</p>
        <textarea
          style={{
            width: "100%",
            border: "1.5px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            padding: 12,
            fontSize: 14,
            fontFamily: "DM Sans, sans-serif",
            background: "var(--bg-secondary)",
            color: "var(--text-primary)",
            resize: "none",
            outline: "none",
            lineHeight: 1.6,
            minHeight: 80,
          }}
          placeholder="Anything else you want to note today..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <button className="btn-primary" onClick={handleSave} disabled={saving}>
        {saving
          ? "Saving..."
          : alreadyLogged
            ? "Update today's log"
            : "Save today's log"}
      </button>
    </div>
  );
}
