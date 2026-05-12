import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";

function triggerConfetti() {
  const colors = [
    "#7f77dd",
    "#d4537e",
    "#f4c0d1",
    "#cecbf6",
    "#ffffff",
    "#fbeaf0",
  ];
  for (let i = 0; i < 40; i++) {
    const piece = document.createElement("div");
    piece.style.cssText = `
      position: fixed;
      width: ${6 + Math.random() * 8}px;
      height: ${6 + Math.random() * 8}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: 2px;
      left: ${20 + Math.random() * 60}%;
      top: 40%;
      z-index: 9999;
      pointer-events: none;
      animation: confettiFall ${0.8 + Math.random() * 0.8}s ease ${Math.random() * 0.3}s forwards;
      transform: rotate(${Math.random() * 360}deg);
    `;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 2000);
  }
}

export default function Log({ session }) {
  const today = new Date().toISOString().split("T")[0];
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [alreadyLogged, setAlreadyLogged] = useState(false);
  const [shake, setShake] = useState(false);
  const [mounted, setMounted] = useState(false);
  const btnRef = useRef(null);

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
    setTimeout(() => setMounted(true), 50);
  }, []);

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

  const addRipple = (e) => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement("span");
    const size = Math.max(rect.width, rect.height);
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255,255,255,0.35);
      width: ${size}px;
      height: ${size}px;
      left: ${e.clientX - rect.left - size / 2}px;
      top: ${e.clientY - rect.top - size / 2}px;
      animation: ripple 0.6s ease forwards;
      pointer-events: none;
    `;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  };

  const handleSave = async (e) => {
    if (e) addRipple(e);
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
    if (error) {
      setError("Could not save your log. Please try again.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } else {
      triggerConfetti();
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
    <div
      className="page"
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
      }}
    >
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(200px) rotate(720deg); opacity: 0; }
        }
        @keyframes ripple {
          0% { transform: scale(0); opacity: 0.4; }
          100% { transform: scale(4); opacity: 0; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        @keyframes successPop {
          0% { transform: scale(0.95); opacity: 0; }
          70% { transform: scale(1.02); }
          100% { transform: scale(1); opacity: 1; }
        }
        .mood-btn {
          transition: all 0.2s ease !important;
        }
        .mood-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(127,119,221,0.15);
        }
        .mood-btn.selected {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(127,119,221,0.2);
        }
        .symptom-tag {
          transition: all 0.15s ease !important;
        }
        .symptom-tag:hover {
          transform: scale(1.05);
        }
        .log-number button {
          transition: all 0.15s ease !important;
        }
        .log-number button:hover {
          transform: scale(1.1);
        }
        .log-number button:active {
          transform: scale(0.95);
        }
      `}</style>

      <h2
        style={{
          fontSize: 22,
          fontWeight: 500,
          marginBottom: 4,
          opacity: mounted ? 1 : 0,
          animation: mounted ? "successPop 0.4s ease 0.1s forwards" : "none",
          animationFillMode: "both",
        }}
      >
        Today's log
      </h2>
      <p
        style={{
          fontSize: 13,
          color: "var(--text-secondary)",
          marginBottom: 20,
          opacity: mounted ? 1 : 0,
          animation: mounted ? "successPop 0.4s ease 0.2s forwards" : "none",
          animationFillMode: "both",
        }}
      >
        {new Date().toLocaleDateString("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
      </p>

      {error && (
        <div
          className="error-msg"
          style={{
            animation: "shake 0.4s ease forwards",
          }}
        >
          {error}
        </div>
      )}

      {saved && (
        <div
          className="success-msg"
          style={{
            animation: "successPop 0.4s ease forwards",
          }}
        >
          🎉 Log saved! Head to Insights to see your AI tips.
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
            animation: "successPop 0.3s ease forwards",
          }}
        >
          You've already logged today — you can update it below.
        </div>
      )}

      {/* Mood card */}
      <div
        className="card"
        style={{
          opacity: mounted ? 1 : 0,
          animation: mounted ? "successPop 0.4s ease 0.15s forwards" : "none",
          animationFillMode: "both",
        }}
      >
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

      {/* Daily habits card */}
      <div
        className="card"
        style={{
          animation: shake ? "shake 0.4s ease forwards" : "none",
          opacity: mounted ? 1 : 0,
          animationFillMode: "both",
        }}
      >
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

      {/* Symptoms card */}
      <div
        className="card"
        style={{
          opacity: mounted ? 1 : 0,
          animation: mounted ? "successPop 0.4s ease 0.25s forwards" : "none",
          animationFillMode: "both",
        }}
      >
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
              className="symptom-tag"
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

      {/* Notes card */}
      <div
        className="card"
        style={{
          opacity: mounted ? 1 : 0,
          animation: mounted ? "successPop 0.4s ease 0.3s forwards" : "none",
          animationFillMode: "both",
        }}
      >
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
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "var(--purple-400)";
            e.target.style.boxShadow = "0 0 0 3px rgba(127,119,221,0.12)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "var(--border)";
            e.target.style.boxShadow = "none";
          }}
          placeholder="Anything else you want to note today..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <button
        ref={btnRef}
        className="btn-primary"
        onClick={handleSave}
        disabled={saving}
        style={{
          position: "relative",
          overflow: "hidden",
          transition: "all 0.2s ease",
          transform: "translateY(0)",
          opacity: mounted ? 1 : 0,
          animation: mounted ? "successPop 0.4s ease 0.35s forwards" : "none",
          animationFillMode: "both",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 8px 20px rgba(127,119,221,0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        {saving ? (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                width: 16,
                height: 16,
                border: "2px solid rgba(255,255,255,0.4)",
                borderTopColor: "white",
                borderRadius: "50%",
                display: "inline-block",
                animation: "spin 0.8s linear infinite",
              }}
            />
            Saving...
          </span>
        ) : alreadyLogged ? (
          "Update today's log"
        ) : (
          "Save today's log"
        )}
      </button>
    </div>
  );
}
