import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function Home({ session, setActivePage }) {
  const [logs, setLogs] = useState([]);
  const [todayLogged, setTodayLogged] = useState(false);

  const name =
    session.user.user_metadata?.full_name?.split(" ")[0] ||
    session.user.email?.split("@")[0] ||
    "there";

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", session.user.id)
        .order("log_date", { ascending: false })
        .limit(7);
      if (data) {
        setLogs(data);
        const today = new Date().toISOString().split("T")[0];
        setTodayLogged(data.some((l) => l.log_date === today));
      }
    };
    fetchLogs();
  }, [session.user.id]);

  const tips = [
    {
      icon: "🥗",
      text: "Low GI foods help manage insulin resistance with PCOD.",
    },
    {
      icon: "😴",
      text: "Aim for 7–9 hours sleep — poor sleep raises cortisol and worsens PCOD.",
    },
    {
      icon: "🏃‍♀️",
      text: "Even a 30 min walk daily can significantly improve PCOD symptoms.",
    },
    {
      icon: "💧",
      text: "Staying hydrated supports hormone balance and reduces bloating.",
    },
  ];
  const dailyTip = tips[new Date().getDay() % tips.length];

  return (
    <div className="page">
      <p className="greeting">{greeting},</p>
      <p className="greeting-name">{name} 💜</p>

      <div className="hero-card">
        <h2>
          {todayLogged ? "Great job logging today!" : "Ready to log your day?"}
        </h2>
        <p>
          {todayLogged
            ? "Your log is in. Check your AI insights to see what your body is telling you."
            : "Track your sleep, food, stress and symptoms. Get personalised PCOD tips."}
        </p>
        <button
          className="hero-btn"
          onClick={() => setActivePage(todayLogged ? "insights" : "log")}
        >
          {todayLogged ? "View my insights →" : "Start today's log →"}
        </button>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-num">{logs.length}</div>
          <div className="stat-label">Days logged this week</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{todayLogged ? "✓" : "—"}</div>
          <div className="stat-label">Today's log</div>
        </div>
      </div>

      <p className="section-title">Today's PCOD tip</p>
      <div
        className="card card-lavender"
        style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
      >
        <span style={{ fontSize: 28 }}>{dailyTip.icon}</span>
        <p
          style={{
            fontSize: 14,
            color: "var(--purple-900)",
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          {dailyTip.text}
        </p>
      </div>

      <p className="section-title">Track with HerRhythm</p>
      <div className="pill-row">
        {[
          "Sleep",
          "Food",
          "Exercise",
          "Stress",
          "Mood",
          "Symptoms",
          "Cycle",
        ].map((t) => (
          <span
            key={t}
            className={`pill ${["Sleep", "Exercise", "Mood"].includes(t) ? "pill-purple" : "pill-pink"}`}
          >
            {t}
          </span>
        ))}
      </div>

      <p className="section-title">Quick links</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[
          { icon: "✨", label: "AI insights", page: "insights" },
          { icon: "🌸", label: "Cycle tracker", page: "cycle" },
          { icon: "📖", label: "Learn about PCOD", page: "learn" },
          { icon: "📝", label: "Daily log", page: "log" },
        ].map((item) => (
          <div
            key={item.page}
            className="card"
            style={{ cursor: "pointer", textAlign: "center", padding: 16 }}
            onClick={() => setActivePage(item.page)}
          >
            <div style={{ fontSize: 24, marginBottom: 6 }}>{item.icon}</div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "var(--text-primary)",
              }}
            >
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
