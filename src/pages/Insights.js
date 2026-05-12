import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const GROQ_API_KEY = process.env.REACT_APP_GROQ_KEY;

export default function Insights({ session }) {
  const [logs, setLogs] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", session.user.id)
        .order("log_date", { ascending: false })
        .limit(7);
      setLogs(data || []);
      setLoadingLogs(false);
    };
    fetchLogs();
  }, [session.user.id]);

  const getInsights = async () => {
    setLoading(true);
    setError("");
    setInsights(null);

    const logsummary = logs
      .map(
        (l) =>
          `Date: ${l.log_date}, Mood: ${l.mood}, Sleep: ${l.sleep_hours}h, Exercise: ${l.exercise}, Stress: ${l.stress_level}/10, Water: ${l.water_glasses} glasses, Food: ${l.food_quality}, Symptoms: ${(l.symptoms || []).join(", ") || "none"}, Notes: ${l.notes || "none"}`,
      )
      .join("\n");

    try {
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            max_tokens: 1000,
            messages: [
              {
                role: "system",
                content: `You are HerRhythm's AI health companion for teenage girls with PCOD. Speak warmly like a knowledgeable older sister. Give personalised PCOD lifestyle advice based on real logged data. Always connect advice to PCOD (insulin resistance, cortisol, hormones). Be encouraging, never judgmental.
Format response as JSON ONLY:
{
  "summary": "2-3 sentence warm summary",
  "highlight": "one positive thing to celebrate",
  "tips": [
    {"tag": "category", "text": "specific tip"},
    {"tag": "category", "text": "specific tip"},
    {"tag": "category", "text": "specific tip"}
  ],
  "watchOut": "one gentle heads-up"
}`,
              },
              {
                role: "user",
                content: `My lifestyle data from the past week:\n\n${logsummary}\n\nPlease give me personalised PCOD lifestyle insights.`,
              },
            ],
          }),
        },
      );

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      const text = data.choices[0].message.content;
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setInsights(parsed);
    } catch (err) {
      setError(
        "Could not get insights right now. Please try again in a moment.",
      );
    }
    setLoading(false);
  };

  const avgSleep = logs.length
    ? (
        logs.reduce((a, b) => a + (b.sleep_hours || 0), 0) / logs.length
      ).toFixed(1)
    : "—";
  const avgStress = logs.length
    ? Math.round(
        logs.reduce((a, b) => a + (b.stress_level || 0), 0) / logs.length,
      )
    : "—";
  const exerciseDays = logs.filter(
    (l) => l.exercise && l.exercise !== "none",
  ).length;

  if (loadingLogs)
    return (
      <div className="page">
        <style>{`
        @keyframes shimmerSlide {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .skeleton {
          background: linear-gradient(90deg, var(--bg-secondary) 25%, var(--purple-50) 50%, var(--bg-secondary) 75%);
          background-size: 200% 100%;
          animation: shimmerSlide 1.5s infinite;
          border-radius: var(--radius-md);
        }
      `}</style>
        <div style={{ marginBottom: 20 }}>
          <div
            className="skeleton"
            style={{ height: 28, width: 180, marginBottom: 8 }}
          />
          <div className="skeleton" style={{ height: 16, width: 120 }} />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
            marginBottom: 20,
          }}
        >
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 72 }} />
          ))}
        </div>
        <div className="skeleton" style={{ height: 120, marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 80, marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 80 }} />
      </div>
    );

  return (
    <div className="page">
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          0% { transform: scale(0.8); opacity: 0; }
          70% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        .tip-card-animated {
          transition: all 0.2s ease !important;
        }
        .tip-card-animated:hover {
          transform: translateX(4px) !important;
          border-left-color: var(--pink-400) !important;
        }
      `}</style>

      <h2
        style={{
          fontSize: 22,
          fontWeight: 500,
          marginBottom: 4,
          opacity: mounted ? 1 : 0,
          animation: mounted ? "fadeSlideUp 0.4s ease forwards" : "none",
          animationFillMode: "both",
        }}
      >
        Your insights ✨
      </h2>
      <p
        style={{
          fontSize: 13,
          color: "var(--text-secondary)",
          marginBottom: 20,
          opacity: mounted ? 1 : 0,
          animation: mounted ? "fadeSlideUp 0.4s ease 0.1s forwards" : "none",
          animationFillMode: "both",
        }}
      >
        Based on your last {logs.length} log{logs.length !== 1 ? "s" : ""}
      </p>

      {logs.length === 0 ? (
        <div
          className="card card-lavender"
          style={{
            textAlign: "center",
            padding: 32,
            animation: "popIn 0.4s ease forwards",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
          <p
            style={{
              fontWeight: 500,
              color: "var(--purple-800)",
              marginBottom: 8,
            }}
          >
            No logs yet
          </p>
          <p
            style={{
              fontSize: 13,
              color: "var(--purple-600)",
              lineHeight: 1.6,
            }}
          >
            Start logging your daily habits to get personalised PCOD insights.
          </p>
        </div>
      ) : (
        <>
          <div
            className="stats-row"
            style={{
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 10,
              marginBottom: 20,
            }}
          >
            {[
              { num: `${avgSleep}h`, label: "Avg sleep" },
              { num: `${avgStress}/10`, label: "Avg stress" },
              { num: exerciseDays, label: "Active days" },
            ].map((s, i) => (
              <div
                key={i}
                className="stat-card"
                style={{
                  animation: `popIn 0.4s ease ${0.1 + i * 0.1}s forwards`,
                  opacity: 0,
                  animationFillMode: "both",
                }}
              >
                <div className="stat-num">{s.num}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {!insights && !loading && (
            <div
              className="card card-lavender"
              style={{
                textAlign: "center",
                padding: 28,
                animation: "popIn 0.4s ease 0.2s forwards",
                opacity: 0,
                animationFillMode: "both",
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 12 }}>🤖</div>
              <p
                style={{
                  fontWeight: 500,
                  color: "var(--purple-800)",
                  marginBottom: 8,
                }}
              >
                Ready for your AI insights
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--purple-600)",
                  lineHeight: 1.6,
                  marginBottom: 20,
                }}
              >
                I'll analyse your {logs.length} log
                {logs.length !== 1 ? "s" : ""} and give you personalised PCOD
                lifestyle tips.
              </p>
              <button
                className="btn-primary"
                onClick={getInsights}
                style={{
                  maxWidth: 240,
                  margin: "0 auto",
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 20px rgba(127,119,221,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                Get my insights →
              </button>
            </div>
          )}

          {loading && (
            <div className="loading-insights">
              <div className="loading-spinner"></div>
              <p className="loading-text">Analysing your PCOD data...</p>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  marginTop: 6,
                }}
              >
                This takes a few seconds
              </p>
            </div>
          )}

          {error && (
            <div
              className="error-msg"
              style={{ animation: "shake 0.4s ease forwards" }}
            >
              {error}
            </div>
          )}

          {insights && (
            <>
              <div
                className="ai-bubble"
                style={{ animation: "fadeSlideUp 0.4s ease forwards" }}
              >
                <div className="ai-from">
                  <div className="ai-dot"></div>HerRhythm AI
                </div>
                <p className="ai-text">{insights.summary}</p>
              </div>

              {insights.highlight && (
                <div
                  className="card"
                  style={{
                    background: "var(--pink-50)",
                    border: "1px solid var(--pink-100)",
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                    animation: "fadeSlideUp 0.4s ease 0.1s forwards",
                    opacity: 0,
                    animationFillMode: "both",
                  }}
                >
                  <span style={{ fontSize: 20 }}>🌸</span>
                  <div>
                    <p
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: "var(--pink-600)",
                        marginBottom: 4,
                      }}
                    >
                      Something to celebrate
                    </p>
                    <p
                      style={{
                        fontSize: 14,
                        color: "var(--pink-800)",
                        lineHeight: 1.6,
                      }}
                    >
                      {insights.highlight}
                    </p>
                  </div>
                </div>
              )}

              <p className="section-title" style={{ marginTop: 8 }}>
                Personalised tips for you
              </p>
              {insights.tips?.map((tip, i) => (
                <div
                  key={i}
                  className="tip-card tip-card-animated"
                  style={{
                    animation: `fadeSlideUp 0.4s ease ${0.15 + i * 0.1}s forwards`,
                    opacity: 0,
                    animationFillMode: "both",
                  }}
                >
                  <span className="tip-tag">{tip.tag}</span>
                  <p className="tip-text">{tip.text}</p>
                </div>
              ))}

              {insights.watchOut && (
                <div
                  className="card"
                  style={{
                    background: "#fffbf0",
                    border: "1px solid #fde8a0",
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                    animation: "fadeSlideUp 0.4s ease 0.4s forwards",
                    opacity: 0,
                    animationFillMode: "both",
                  }}
                >
                  <span style={{ fontSize: 20 }}>⚠️</span>
                  <div>
                    <p
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: "#8a6800",
                        marginBottom: 4,
                      }}
                    >
                      Something to watch
                    </p>
                    <p
                      style={{
                        fontSize: 14,
                        color: "#6b5100",
                        lineHeight: 1.6,
                      }}
                    >
                      {insights.watchOut}
                    </p>
                  </div>
                </div>
              )}

              <button
                className="btn-secondary"
                onClick={getInsights}
                style={{
                  marginTop: 16,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-2px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                Refresh insights
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}
