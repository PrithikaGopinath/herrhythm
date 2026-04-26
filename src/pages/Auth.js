import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (error) setError(error.message);
      else
        setSuccess(
          "Account created! Please check your email to verify, then log in.",
        );
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-screen">
      <div className="auth-logo">HerRhythm</div>
      <div className="auth-tagline">
        Your PCOD companion — track, learn, and thrive.
      </div>

      <div style={{ flex: 1 }}>
        <h1 className="auth-title">
          {mode === "login" ? "Welcome back 💜" : "Join HerRhythm 🌸"}
        </h1>
        <p className="auth-subtitle">
          {mode === "login"
            ? "Log in to continue your PCOD wellness journey."
            : "Built by a teen with PCOD, for teens with PCOD."}
        </p>

        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}

        {mode === "signup" && (
          <div className="form-group">
            <label className="form-label">Your name</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. Aisha"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Email address</label>
          <input
            className="form-input"
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            className="form-input"
            type="password"
            placeholder="Min. 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        </div>

        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading
            ? "Please wait..."
            : mode === "login"
              ? "Log in"
              : "Create account"}
        </button>

        <div className="auth-switch">
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <button
                onClick={() => {
                  setMode("signup");
                  setError("");
                  setSuccess("");
                }}
              >
                Sign up free
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => {
                  setMode("login");
                  setError("");
                  setSuccess("");
                }}
              >
                Log in
              </button>
            </>
          )}
        </div>
      </div>

      <div
        style={{
          marginTop: 32,
          padding: "16px",
          background: "var(--purple-50)",
          borderRadius: "var(--radius-md)",
          textAlign: "center",
        }}
      >
        <p
          style={{ fontSize: 13, color: "var(--purple-600)", lineHeight: 1.6 }}
        >
          💜 Your data is private and secure. HerRhythm never shares your health
          information.
        </p>
      </div>
    </div>
  );
}
