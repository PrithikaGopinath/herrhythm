import { useState } from "react";

const GROQ_API_KEY = process.env.REACT_APP_GROQ_KEY;

export default function DoctorPrep({ session }) {
  const [step, setStep] = useState("intro");
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null);
  const [answers, setAnswers] = useState({
    visitReason: "",
    mainSymptoms: [],
    duration: "",
    medications: "",
    concerns: "",
    lastPeriod: "",
    cycleRegular: "",
  });

  const symptoms = [
    "Irregular periods",
    "Acne",
    "Hair loss",
    "Weight gain",
    "Fatigue",
    "Mood swings",
    "Excess hair growth",
    "Difficulty sleeping",
    "Bloating",
    "Cramps",
    "Headaches",
    "Low mood",
  ];

  const toggleSymptom = (s) => {
    setAnswers((prev) => ({
      ...prev,
      mainSymptoms: prev.mainSymptoms.includes(s)
        ? prev.mainSymptoms.filter((x) => x !== s)
        : [...prev.mainSymptoms, s],
    }));
  };

  const generatePrep = async () => {
    setLoading(true);
    setStep("loading");

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
            max_tokens: 1500,
            messages: [
              {
                role: "system",
                content: `You are a helpful medical preparation assistant for teenage girls with PCOD. 
Generate a personalised doctor appointment preparation guide based on the user's symptoms and concerns.
Be warm, clear and empowering. Help the girl feel confident going into her appointment.
Format your response as JSON with this exact structure:
{
  "summary": "2 sentence summary of what to focus on at this appointment",
  "questionsToAsk": ["question 1", "question 2", "question 3", "question 4", "question 5"],
  "symptomsToMention": ["symptom detail 1", "symptom detail 2", "symptom detail 3"],
  "thingsToTrack": ["thing to track 1", "thing to track 2", "thing to track 3"],
  "reminder": "one warm encouraging reminder for the appointment"
}`,
              },
              {
                role: "user",
                content: `Please help me prepare for my doctor appointment.
Visit reason: ${answers.visitReason}
Main symptoms: ${answers.mainSymptoms.join(", ")}
How long I've had these symptoms: ${answers.duration}
Current medications: ${answers.medications || "none"}
My main concerns: ${answers.concerns}
Last period: ${answers.lastPeriod}
Regular cycle: ${answers.cycleRegular}`,
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
      setResult(parsed);
      setStep("result");
    } catch (err) {
      setStep("error");
    }
    setLoading(false);
  };

  if (step === "intro")
    return (
      <div className="page">
        <h2 style={{ fontSize: 22, fontWeight: 500, marginBottom: 4 }}>
          Doctor prep 🩺
        </h2>
        <p
          style={{
            fontSize: 13,
            color: "var(--text-secondary)",
            marginBottom: 20,
          }}
        >
          Feel confident and prepared for your next PCOD appointment.
        </p>

        <div className="card card-purple" style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>
            Why this matters 💜
          </p>
          <p style={{ fontSize: 13, opacity: 0.9, lineHeight: 1.7 }}>
            Many girls with PCOD leave appointments feeling unheard. Being
            prepared with the right questions helps you get the care you
            deserve.
          </p>
        </div>

        <div className="card" style={{ padding: "4px 18px", marginBottom: 20 }}>
          {[
            { icon: "📋", text: "Answer a few quick questions" },
            { icon: "🤖", text: "AI generates your personalised prep guide" },
            { icon: "💬", text: "Get questions to ask your doctor" },
            { icon: "✅", text: "Walk in feeling confident" },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 0",
                borderBottom: i < 3 ? "1px solid var(--border)" : "none",
              }}
            >
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <p style={{ fontSize: 14, color: "var(--text-primary)" }}>
                {item.text}
              </p>
            </div>
          ))}
        </div>

        <button className="btn-primary" onClick={() => setStep("form")}>
          Start my prep →
        </button>
      </div>
    );

  if (step === "form")
    return (
      <div className="page">
        <button
          onClick={() => setStep("intro")}
          style={{
            background: "none",
            border: "none",
            color: "var(--purple-600)",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "DM Sans, sans-serif",
            padding: 0,
            marginBottom: 20,
          }}
        >
          ← Back
        </button>

        <h2 style={{ fontSize: 22, fontWeight: 500, marginBottom: 4 }}>
          Tell me about your visit
        </h2>
        <p
          style={{
            fontSize: 13,
            color: "var(--text-secondary)",
            marginBottom: 24,
          }}
        >
          The more you share, the better your prep guide will be.
        </p>

        <div className="card">
          <p className="log-section-title">Why are you seeing the doctor?</p>
          <textarea
            value={answers.visitReason}
            onChange={(e) =>
              setAnswers((prev) => ({ ...prev, visitReason: e.target.value }))
            }
            placeholder="e.g. Follow up on PCOD diagnosis, first time discussing symptoms..."
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
          />
        </div>

        <div className="card">
          <p className="log-section-title">Current symptoms</p>
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
            {symptoms.map((s) => (
              <div
                key={s}
                onClick={() => toggleSymptom(s)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: answers.mainSymptoms.includes(s) ? 500 : 400,
                  background: answers.mainSymptoms.includes(s)
                    ? "var(--pink-50)"
                    : "var(--bg-secondary)",
                  color: answers.mainSymptoms.includes(s)
                    ? "var(--pink-600)"
                    : "var(--text-secondary)",
                  border: `1.5px solid ${answers.mainSymptoms.includes(s) ? "var(--pink-100)" : "var(--border)"}`,
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
          <p className="log-section-title">
            How long have you had these symptoms?
          </p>
          <select
            className="log-select"
            style={{ width: "100%" }}
            value={answers.duration}
            onChange={(e) =>
              setAnswers((prev) => ({ ...prev, duration: e.target.value }))
            }
          >
            <option value="">Select...</option>
            <option value="less than 1 month">Less than 1 month</option>
            <option value="1-3 months">1-3 months</option>
            <option value="3-6 months">3-6 months</option>
            <option value="6-12 months">6-12 months</option>
            <option value="more than 1 year">More than 1 year</option>
          </select>
        </div>

        <div className="card">
          <p className="log-section-title">When was your last period?</p>
          <input
            type="date"
            className="form-input"
            value={answers.lastPeriod}
            onChange={(e) =>
              setAnswers((prev) => ({ ...prev, lastPeriod: e.target.value }))
            }
          />
        </div>

        <div className="card">
          <p className="log-section-title">Is your cycle regular?</p>
          <div style={{ display: "flex", gap: 10 }}>
            {["Yes", "No", "Sometimes"].map((opt) => (
              <div
                key={opt}
                onClick={() =>
                  setAnswers((prev) => ({ ...prev, cycleRegular: opt }))
                }
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "var(--radius-md)",
                  textAlign: "center",
                  fontSize: 14,
                  cursor: "pointer",
                  border: `1.5px solid ${answers.cycleRegular === opt ? "var(--purple-400)" : "var(--border)"}`,
                  background:
                    answers.cycleRegular === opt
                      ? "var(--purple-50)"
                      : "var(--bg-secondary)",
                  color:
                    answers.cycleRegular === opt
                      ? "var(--purple-600)"
                      : "var(--text-secondary)",
                  fontWeight: answers.cycleRegular === opt ? 500 : 400,
                  transition: "all 0.15s",
                }}
              >
                {opt}
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <p className="log-section-title">Any current medications?</p>
          <input
            className="form-input"
            placeholder="e.g. metformin, birth control, or none"
            value={answers.medications}
            onChange={(e) =>
              setAnswers((prev) => ({ ...prev, medications: e.target.value }))
            }
          />
        </div>

        <div className="card">
          <p className="log-section-title">What's your biggest concern?</p>
          <textarea
            value={answers.concerns}
            onChange={(e) =>
              setAnswers((prev) => ({ ...prev, concerns: e.target.value }))
            }
            placeholder="e.g. my hair is falling out a lot, I haven't had a period in 3 months..."
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
          />
        </div>

        <button
          className="btn-primary"
          onClick={generatePrep}
          disabled={!answers.visitReason || answers.mainSymptoms.length === 0}
        >
          Generate my prep guide →
        </button>
      </div>
    );

  if (step === "loading")
    return (
      <div className="page">
        <div className="loading-insights" style={{ paddingTop: 80 }}>
          <div className="loading-spinner"></div>
          <p className="loading-text">Preparing your appointment guide...</p>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
            This takes a few seconds
          </p>
        </div>
      </div>
    );

  if (step === "error")
    return (
      <div className="page">
        <div className="error-msg">Something went wrong. Please try again.</div>
        <button className="btn-secondary" onClick={() => setStep("form")}>
          ← Go back
        </button>
      </div>
    );

  if (step === "result" && result)
    return (
      <div className="page">
        <h2 style={{ fontSize: 22, fontWeight: 500, marginBottom: 4 }}>
          Your prep guide 🩺
        </h2>
        <p
          style={{
            fontSize: 13,
            color: "var(--text-secondary)",
            marginBottom: 20,
          }}
        >
          You're ready for your appointment!
        </p>

        <div className="ai-bubble" style={{ marginBottom: 20 }}>
          <div className="ai-from">
            <div className="ai-dot"></div>
            HerRhythm AI
          </div>
          <p className="ai-text">{result.summary}</p>
        </div>

        <p className="section-title">Questions to ask your doctor</p>
        <div className="card" style={{ padding: "4px 18px", marginBottom: 14 }}>
          {result.questionsToAsk?.map((q, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "12px 0",
                borderBottom:
                  i < result.questionsToAsk.length - 1
                    ? "1px solid var(--border)"
                    : "none",
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  color: "var(--purple-400)",
                  fontWeight: 500,
                  flexShrink: 0,
                }}
              >
                {i + 1}.
              </span>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--text-primary)",
                  lineHeight: 1.6,
                }}
              >
                {q}
              </p>
            </div>
          ))}
        </div>

        <p className="section-title">Symptoms to mention</p>
        <div className="card" style={{ padding: "4px 18px", marginBottom: 14 }}>
          {result.symptomsToMention?.map((s, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "12px 0",
                borderBottom:
                  i < result.symptomsToMention.length - 1
                    ? "1px solid var(--border)"
                    : "none",
              }}
            >
              <span style={{ color: "var(--pink-400)", flexShrink: 0 }}>
                🌸
              </span>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--text-primary)",
                  lineHeight: 1.6,
                }}
              >
                {s}
              </p>
            </div>
          ))}
        </div>

        <p className="section-title">Things to start tracking</p>
        <div className="card" style={{ padding: "4px 18px", marginBottom: 14 }}>
          {result.thingsToTrack?.map((t, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "12px 0",
                borderBottom:
                  i < result.thingsToTrack.length - 1
                    ? "1px solid var(--border)"
                    : "none",
              }}
            >
              <span style={{ flexShrink: 0 }}>✅</span>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--text-primary)",
                  lineHeight: 1.6,
                }}
              >
                {t}
              </p>
            </div>
          ))}
        </div>

        {result.reminder && (
          <div className="card card-pink">
            <p
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "var(--pink-800)",
                marginBottom: 6,
              }}
            >
              Remember 💜
            </p>
            <p
              style={{
                fontSize: 13,
                color: "var(--pink-600)",
                lineHeight: 1.7,
              }}
            >
              {result.reminder}
            </p>
          </div>
        )}

        <button
          className="btn-secondary"
          onClick={() => {
            setStep("intro");
            setResult(null);
            setAnswers({
              visitReason: "",
              mainSymptoms: [],
              duration: "",
              medications: "",
              concerns: "",
              lastPeriod: "",
              cycleRegular: "",
            });
          }}
        >
          Start over
        </button>
      </div>
    );

  return null;
}
