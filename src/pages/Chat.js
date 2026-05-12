import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";

const GROQ_API_KEY = process.env.REACT_APP_GROQ_KEY
export default function Chat({ session }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm Rhya, your PCOD companion 💜 I'm here to answer any questions you have about PCOD, your symptoms, lifestyle, or just how you're feeling. What's on your mind?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userLogs, setUserLogs] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", session.user.id)
        .order("log_date", { ascending: false })
        .limit(7);
      setUserLogs(data || []);
    };
    fetchLogs();
  }, [session.user.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getLogContext = () => {
    if (userLogs.length === 0) return "The user has not logged any data yet.";
    return userLogs
      .map(
        (l) =>
          `Date: ${l.log_date}, Mood: ${l.mood}, Sleep: ${l.sleep_hours}h, Exercise: ${l.exercise}, Stress: ${l.stress_level}/10, Water: ${l.water_glasses} glasses, Food: ${l.food_quality}, Symptoms: ${(l.symptoms || []).join(", ") || "none"}`,
      )
      .join("\n");
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

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
                content: `You are Rhya, a warm and knowledgeable PCOD companion chatbot inside the HerRhythm app, designed specifically for teenage girls with PCOD (Polycystic Ovarian Disease).

Your personality:
- Warm, friendly, and empathetic — like a knowledgeable older sister
- Never clinical or scary
- Always encouraging and empowering
- Use simple, teen-friendly language
- Use occasional emojis to feel approachable
- Never judgmental about lifestyle choices

Your knowledge:
- Deep expertise in PCOD — symptoms, causes, lifestyle management, hormones, insulin resistance, cortisol, androgens
- Nutrition for PCOD, exercise, sleep, stress management
- Emotional support for teens dealing with PCOD diagnosis
- When to see a doctor

Important rules:
- Always relate advice back to PCOD specifically
- Never diagnose or prescribe — always suggest seeing a doctor for medical decisions
- If someone seems distressed, be extra gentle and supportive
- Keep responses concise — 3-5 sentences max unless more detail is needed
- Never make the user feel bad about their habits

Here is the user's recent lifestyle data for context (use this to personalise responses when relevant):
${getLogContext()}`,
              },
              ...updatedMessages.map((m) => ({
                role: m.role,
                content: m.content,
              })),
            ],
          }),
        },
      );

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      const reply = data.choices[0].message.content;
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I'm having trouble connecting right now 💜 Please try again in a moment.",
        },
      ]);
    }
    setLoading(false);
  };

  const suggestions = [
    "Why is my hair falling out?",
    "What should I eat with PCOD?",
    "Is it normal to miss periods?",
    "How does stress affect PCOD?",
    "Can I still have kids with PCOD?",
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 120px)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px 12px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "var(--purple-400)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}
          >
            💜
          </div>
          <div>
            <p
              style={{
                fontSize: 15,
                fontWeight: 500,
                color: "var(--text-primary)",
              }}
            >
              Rhya
            </p>
            <p style={{ fontSize: 12, color: "var(--purple-400)" }}>
              ● Your PCOD companion
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {messages.length === 1 && (
          <div>
            <p
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                marginBottom: 8,
              }}
            >
              Common questions
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  onClick={() => setInput(s)}
                  style={{
                    padding: "7px 12px",
                    borderRadius: 20,
                    fontSize: 12,
                    background: "var(--purple-50)",
                    color: "var(--purple-600)",
                    border: "1px solid var(--purple-100)",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              alignItems: "flex-end",
              gap: 8,
            }}
          >
            {msg.role === "assistant" && (
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "var(--purple-400)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  flexShrink: 0,
                }}
              >
                💜
              </div>
            )}
            <div
              style={{
                maxWidth: "75%",
                padding: "11px 14px",
                borderRadius:
                  msg.role === "user"
                    ? "var(--radius-lg) var(--radius-lg) 4px var(--radius-lg)"
                    : "4px var(--radius-lg) var(--radius-lg) var(--radius-lg)",
                background:
                  msg.role === "user"
                    ? "var(--purple-400)"
                    : "var(--purple-50)",
                color: msg.role === "user" ? "white" : "var(--purple-900)",
                fontSize: 14,
                lineHeight: 1.6,
                border:
                  msg.role === "assistant"
                    ? "1px solid var(--purple-100)"
                    : "none",
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "var(--purple-400)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
              }}
            >
              💜
            </div>
            <div
              style={{
                padding: "11px 16px",
                borderRadius:
                  "4px var(--radius-lg) var(--radius-lg) var(--radius-lg)",
                background: "var(--purple-50)",
                border: "1px solid var(--purple-100)",
                display: "flex",
                gap: 4,
                alignItems: "center",
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--purple-400)",
                    animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid var(--border)",
          background: "var(--bg-primary)",
          display: "flex",
          gap: 10,
          alignItems: "flex-end",
        }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Ask Rhya anything about PCOD..."
          rows={1}
          style={{
            flex: 1,
            padding: "12px 14px",
            borderRadius: 20,
            border: "1.5px solid var(--border)",
            fontSize: 14,
            fontFamily: "DM Sans, sans-serif",
            background: "var(--bg-secondary)",
            color: "var(--text-primary)",
            outline: "none",
            resize: "none",
            lineHeight: 1.5,
            maxHeight: 100,
            overflowY: "auto",
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: input.trim() ? "var(--purple-400)" : "var(--border)",
            border: "none",
            cursor: input.trim() ? "pointer" : "not-allowed",
            fontSize: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
            flexShrink: 0,
          }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}
