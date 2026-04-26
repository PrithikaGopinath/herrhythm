import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const ANTHROPIC_API_KEY = process.env.REACT_APP_ANTHROPIC_KEY;

export default function Insights({ session }) {
  const [logs, setLogs] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [error, setError] = useState("");

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
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are HerRhythm's AI health companion, specifically designed for teenage girls with PCOD (Polycystic Ovarian Disease). 
You speak in a warm, friendly, non-clinical tone — like a knowledgeable older sister who understands PCOD deeply.
You give personalised, actionable lifestyle advice based on the user's actual logged data.
Always connect your advice to PCOD specifically — explain HOW and WHY habits affect PCOD symptoms (insulin resistance, cortisol, inflammation, hormones).
Be encouraging and empowering, never judgmental.
Format your response as JSON with this exact structure:
{
  "summary": "2-3 sentence warm summary of how their week looks",
  "highlight": "one specific positive thing from their data worth celebrating",
  "tips": [
    {"tag": "category (e.g. Sleep, Food, Exercise, Stress, Hydration)", "text": "specific personalised tip connected to PCOD"},
    {"tag": "category", "text": "specific personalised tip"},
    {"tag": "category", "text": "specific personalised tip"}
  ],
  "watchOut": "one gentle heads-up about something in their data that could affect PCOD"
}`,
          messages: [
            {
              role: "user",
              content: `Here is my lifestyle data from the past week:\n\n${logsummary}\n\nPlease give me personalised PCOD lifestyle insights based on my actual data.`,
            },
          ],
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      const text = data.content[0].text;
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
        <div className="loading-insights">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading your data...</p>
        </div>
      </div>
    );

  return (
    <div className="page">
      <h2 style={{ fontSize: 22, fontWeight: 500, marginBottom: 4 }}>
        Your insights ✨
      </h2>
      <p
        style={{
          fontSize: 13,
          color: "var(--text-secondary)",
          marginBottom: 20,
        }}
      >
        Based on your last {logs.length} log{logs.length !== 1 ? "s" : ""}
      </p>

      {logs.length === 0 ? (
        <div
          className="card card-lavender"
          style={{ textAlign: "center", padding: 32 }}
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
            <div className="stat-card">
              <div className="stat-num">{avgSleep}h</div>
              <div className="stat-label">Avg sleep</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">{avgStress}/10</div>
              <div className="stat-label">Avg stress</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">{exerciseDays}</div>
              <div className="stat-label">Active days</div>
            </div>
          </div>

          {!insights && !loading && (
            <div
              className="card card-lavender"
              style={{ textAlign: "center", padding: 28 }}
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
                style={{ maxWidth: 240, margin: "0 auto" }}
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

          {error && <div className="error-msg">{error}</div>}

          {insights && (
            <>
              <div className="ai-bubble">
                <div className="ai-from">
                  <div className="ai-dot"></div>
                  HerRhythm AI
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
                <div key={i} className="tip-card">
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
                style={{ marginTop: 16 }}
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
