import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSplash, setShowSplash] = useState(true);
  const [splashFading, setSplashFading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [petalsBurst, setPetalsBurst] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setPetalsBurst(true), 1200);
    const t2 = setTimeout(() => setSplashFading(true), 2400);
    const t3 = setTimeout(() => {
      setShowSplash(false);
      setFormVisible(true);
    }, 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const handleSubmit = async () => {
    setError(""); setSuccess(""); setLoading(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email, password, options: { data: { full_name: name } },
      });
      if (error) setError(error.message);
      else setSuccess("Account created! You can now log in.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    }
    setLoading(false);
  };

  const features = [
    { icon: "📝", text: "Log your daily habits" },
    { icon: "✨", text: "Get AI-powered PCOD insights" },
    { icon: "🌸", text: "Track your cycle" },
    { icon: "💬", text: "Chat with Rhya, your AI companion" },
    { icon: "👭", text: "Connect with the PCOD community" },
  ];

  const flyingPetals = [...Array(20)].map((_, i) => ({
    id: i,
    left: `${5 + ((i * 4.5) % 90)}%`,
    delay: i * 0.06,
    duration: 1.5 + (i % 4) * 0.3,
    size: 8 + (i % 5) * 3,
    rotate: i * 23,
    color: ["#d4537e","#f4c0d1","#7f77dd","#cecbf6","#fbeaf0","#993556"][i % 6],
  }));

  const flowerPetals = [0,45,90,135,180,225,270,315].map((angle, i) => ({ angle, delay: i * 0.1 }));

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes splashBgIn { 0%{opacity:0} 100%{opacity:1} }
        @keyframes splashBgOut { 0%{opacity:1;transform:scale(1)} 100%{opacity:0;transform:scale(1.08)} }
        @keyframes stemGrow { 0%{height:0;opacity:0} 100%{height:80px;opacity:1} }
        @keyframes petalBloom {
          0%{opacity:0;transform:rotate(var(--angle)) translateY(-28px) scale(0)}
          60%{opacity:1;transform:rotate(var(--angle)) translateY(-28px) scale(1.15)}
          100%{opacity:1;transform:rotate(var(--angle)) translateY(-28px) scale(1)}
        }
        @keyframes petalFly {
          0%{opacity:1;transform:rotate(var(--angle)) translateY(-28px) scale(1)}
          100%{opacity:0;transform:rotate(var(--rotate)) translateY(-300px) scale(0.2)}
        }
        @keyframes centrePopIn {
          0%{transform:scale(0);opacity:0}
          70%{transform:scale(1.2);opacity:1}
          100%{transform:scale(1);opacity:1}
        }
        @keyframes glowPulse {
          0%,100%{box-shadow:0 0 20px rgba(212,83,126,0.5)}
          50%{box-shadow:0 0 40px rgba(212,83,126,0.9),0 0 60px rgba(127,119,221,0.4)}
        }
        @keyframes petalRain {
          0%{transform:translateY(-50px) rotate(0deg);opacity:0}
          10%{opacity:1}
          100%{transform:translateY(110vh) rotate(var(--rotate));opacity:0.5}
        }
        @keyframes logoReveal {
          0%{opacity:0;transform:scale(0.7) translateY(10px);filter:blur(6px)}
          100%{opacity:1;transform:scale(1) translateY(0);filter:blur(0)}
        }
        @keyframes taglineIn {
          0%{opacity:0;transform:translateY(12px)}
          100%{opacity:1;transform:translateY(0)}
        }
        @keyframes heartbeat {
          0%,100%{transform:scale(1)}
          25%{transform:scale(1.18)}
          75%{transform:scale(1.1)}
        }
        @keyframes dropDown {
          0%{opacity:0;transform:translateY(-60px)}
          60%{transform:translateY(6px)}
          100%{opacity:1;transform:translateY(0)}
        }
        @keyframes leftIn {
          0%{opacity:0;transform:translateX(-50px)}
          100%{opacity:1;transform:translateX(0)}
        }
        @keyframes featureIn {
          0%{opacity:0;transform:translateX(-20px)}
          100%{opacity:1;transform:translateX(0)}
        }
        @keyframes float {
          0%,100%{transform:translateY(0)}
          50%{transform:translateY(-10px)}
        }
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-8px)}
          40%{transform:translateX(8px)}
          60%{transform:translateX(-5px)}
          80%{transform:translateX(5px)}
        }
        @keyframes lightTurnOn {
          0%{opacity:0;filter:brightness(0)}
          30%{opacity:0.3;filter:brightness(0.3)}
          100%{opacity:1;filter:brightness(1)}
        }
        .auth-input-glow { transition: all 0.25s ease !important; }
        .auth-input-glow:focus {
          border-color: var(--purple-400) !important;
          box-shadow: 0 0 0 3px rgba(127,119,221,0.15) !important;
          transform: scale(1.005) !important;
        }
        .auth-btn-glow {
          transition: all 0.25s ease !important;
          position: relative !important;
          overflow: hidden !important;
        }
        .auth-btn-glow:hover {
          transform: translateY(-3px) !important;
          box-shadow: 0 12px 28px rgba(127,119,221,0.4) !important;
        }
        .feature-item-auth { transition: transform 0.2s ease !important; }
        .feature-item-auth:hover { transform: translateX(8px) !important; }
        .auth-left-panel { display: none; }
        @media (min-width: 768px) { .auth-left-panel { display: flex !important; } }
      `}</style>

      {/* ══ FLOWER SPLASH ══ */}
      {showSplash && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "linear-gradient(160deg,#1a1040 0%,#3c3489 40%,#7f77dd 75%,#d4537e 100%)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          overflow: "hidden",
          animation: splashFading ? "splashBgOut 0.8s ease forwards" : "splashBgIn 0.5s ease forwards",
        }}>

          {/* Raining petals */}
          {petalsBurst && flyingPetals.map(p => (
            <div key={p.id} style={{
              position: "absolute", left: p.left, top: "-20px",
              width: p.size, height: p.size * 1.3,
              background: p.color, borderRadius: "50% 50% 50% 0",
              transform: `rotate(${p.rotate}deg)`,
              animation: `petalRain ${p.duration}s ease ${p.delay}s forwards`,
              "--rotate": `${p.rotate + 180}deg`, opacity: 0,
            }}/>
          ))}

          {/* Flower */}
          <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2 }}>
            <div style={{ position: "relative", width: 140, height: 140, marginBottom: 20 }}>

              {/* Outer pink petals */}
              {flowerPetals.map((petal, i) => (
                <div key={i} style={{
                  position: "absolute", top: "50%", left: "50%",
                  width: 38, height: 55, marginLeft: -19, marginTop: -27,
                  background: "linear-gradient(180deg,#f4c0d1 0%,#d4537e 100%)",
                  borderRadius: "50% 50% 50% 0", transformOrigin: "bottom center",
                  animation: petalsBurst
                    ? `petalFly 0.8s ease ${petal.delay * 0.3}s forwards`
                    : `petalBloom 0.7s ease ${0.2 + petal.delay}s both`,
                  "--angle": `${petal.angle}deg`,
                  "--rotate": `${petal.angle + 60}deg`,
                  opacity: 0, animationFillMode: "both",
                  boxShadow: "0 2px 10px rgba(212,83,126,0.4)",
                }}/>
              ))}

              {/* Inner purple petals */}
              {flowerPetals.map((petal, i) => (
                <div key={`inner-${i}`} style={{
                  position: "absolute", top: "50%", left: "50%",
                  width: 26, height: 38, marginLeft: -13, marginTop: -19,
                  background: "linear-gradient(180deg,#cecbf6 0%,#7f77dd 100%)",
                  borderRadius: "50% 50% 50% 0", transformOrigin: "bottom center",
                  transform: `rotate(${petal.angle + 22.5}deg) translateY(-22px)`,
                  animation: petalsBurst ? "none" : `petalBloom 0.6s ease ${0.4 + petal.delay}s both`,
                  opacity: petalsBurst ? 0 : 0, animationFillMode: "both",
                  boxShadow: "0 2px 8px rgba(127,119,221,0.4)",
                }}/>
              ))}

              {/* Centre */}
              <div style={{
                position: "absolute", top: "50%", left: "50%",
                width: 46, height: 46, marginLeft: -23, marginTop: -23,
                borderRadius: "50%",
                background: "radial-gradient(circle,#fbeaf0 0%,#f4c0d1 60%,#d4537e 100%)",
                animation: `centrePopIn 0.5s ease 1.2s both, glowPulse 2s ease 1.7s infinite`,
                zIndex: 3, animationFillMode: "both",
              }}/>

              {/* Stem */}
              {!petalsBurst && (
                <div style={{
                  position: "absolute", bottom: -80, left: "50%",
                  width: 5, marginLeft: -2.5,
                  background: "linear-gradient(180deg,#5a9e6f,#3d7a52)",
                  borderRadius: 4,
                  animation: "stemGrow 0.5s ease 0.1s both",
                  transformOrigin: "top", animationFillMode: "both",
                }}/>
              )}
            </div>

            {/* Logo */}
            <div style={{
              textAlign: "center",
              animation: "logoReveal 0.8s ease 1.4s both",
              animationFillMode: "both", opacity: 0,
            }}>
              <div style={{
                fontFamily: "Playfair Display, Georgia, serif",
                fontSize: 54, fontWeight: 700,
                background: "linear-gradient(135deg,#ffffff 0%,#f4c0d1 50%,#cecbf6 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundClip: "text", letterSpacing: "-1.5px",
              }}>HerRhythm</div>
              <p style={{
                fontSize: 16, color: "rgba(255,255,255,0.8)",
                marginTop: 8, letterSpacing: "0.06em",
                animation: "taglineIn 0.6s ease 1.8s both",
                animationFillMode: "both", opacity: 0,
              }}>Your PCOD companion</p>
              <p style={{
                fontSize: 12, color: "rgba(255,255,255,0.5)",
                marginTop: 6, letterSpacing: "0.14em", textTransform: "uppercase",
                animation: "taglineIn 0.6s ease 2s both",
                animationFillMode: "both", opacity: 0,
              }}>Track · Learn · Thrive</p>
            </div>

            {/* Loading dots */}
            <div style={{
              display: "flex", gap: 8, marginTop: 40,
              animation: "taglineIn 0.5s ease 2.1s both",
              animationFillMode: "both", opacity: 0,
            }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: "rgba(255,255,255,0.5)",
                  animation: `heartbeat 1s ease ${i * 0.2}s infinite`,
                }}/>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ AUTH FORM ══ */}
      <div style={{
        minHeight: "100vh", display: "flex",
        background: "var(--bg-primary)", width: "100%",
        visibility: formVisible ? "visible" : "hidden",
        animation: formVisible ? "lightTurnOn 0.8s ease forwards" : "none",
      }}>
        {/* Left panel */}
        <div className="auth-left-panel" style={{
          flex: 1,
          background: "linear-gradient(160deg,#3c3489 0%,#7f77dd 60%,#d4537e 100%)",
          padding: "64px 56px", flexDirection: "column",
          justifyContent: "center", minHeight: "100vh",
          position: "relative", overflow: "hidden",
          animation: formVisible ? "leftIn 0.9s ease 0.1s both" : "none",
          opacity: 0, animationFillMode: "both",
        }}>
          <div style={{ position:"absolute", top:-100, right:-100, width:350, height:350, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }}/>
          <div style={{ position:"absolute", bottom:-80, left:-80, width:280, height:280, borderRadius:"50%", background:"rgba(212,83,126,0.12)" }}/>
          <div style={{ position:"absolute", top:40, right:40, fontSize:40, opacity:0.3, animation:"float 4s ease-in-out infinite" }}>🌸</div>
          <div style={{ position:"absolute", bottom:80, right:60, fontSize:24, opacity:0.2, animation:"float 5s ease-in-out 1s infinite" }}>🌸</div>

          <div style={{ animation: formVisible ? "featureIn 0.6s ease 0.2s both" : "none", opacity:0, animationFillMode:"both" }}>
            <div style={{ fontFamily:"Playfair Display,Georgia,serif", fontSize:44, marginBottom:12, background:"linear-gradient(135deg,#ffffff 0%,#f4c0d1 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
              HerRhythm
            </div>
            <p style={{ fontSize:16, color:"rgba(255,255,255,0.75)", lineHeight:1.7, marginBottom:40 }}>
              Your PCOD companion — track, learn, and thrive.
            </p>
          </div>

          {features.map((item, i) => (
            <div key={i} className="feature-item-auth" style={{
              display:"flex", alignItems:"center", gap:14, marginBottom:20,
              animation: formVisible ? `featureIn 0.5s ease ${0.3+i*0.1}s both` : "none",
              opacity:0, animationFillMode:"both",
            }}>
              <div style={{ width:38, height:38, borderRadius:10, background:"rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>
                {item.icon}
              </div>
              <p style={{ fontSize:15, color:"rgba(255,255,255,0.9)" }}>{item.text}</p>
            </div>
          ))}

          <div style={{ marginTop:40, padding:24, background:"rgba(255,255,255,0.1)", borderRadius:"var(--radius-lg)", borderLeft:"3px solid rgba(244,192,209,0.6)", animation: formVisible ? "featureIn 0.6s ease 0.9s both" : "none", opacity:0, animationFillMode:"both" }}>
            <p style={{ fontSize:14, color:"rgba(255,255,255,0.9)", lineHeight:1.8, fontStyle:"italic" }}>
              "I built HerRhythm because I have PCOD myself. I couldn't find a single app that spoke to me as a teenager."
            </p>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.6)", marginTop:10, fontWeight:500 }}>— Prithika, founder</p>
          </div>
        </div>

        {/* Right form */}
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"48px 64px", background:"var(--bg-primary)", minHeight:"100vh" }}>
          <div style={{ width:"100%", maxWidth:440 }}>
            <div className="auth-logo" style={{ animation: formVisible ? "dropDown 0.7s ease 0.1s both" : "none", opacity:0, animationFillMode:"both" }}>HerRhythm</div>
            <div className="auth-tagline" style={{ animation: formVisible ? "dropDown 0.7s ease 0.15s both" : "none", opacity:0, animationFillMode:"both" }}>
              Your PCOD companion — track, learn, and thrive.
            </div>
            <h1 className="auth-title" style={{ animation: formVisible ? "dropDown 0.7s ease 0.2s both" : "none", opacity:0, animationFillMode:"both" }}>
              {mode === "login" ? "Welcome back 💜" : "Join HerRhythm 🌸"}
            </h1>
            <p className="auth-subtitle" style={{ animation: formVisible ? "dropDown 0.6s ease 0.25s both" : "none", opacity:0, animationFillMode:"both" }}>
              {mode === "login" ? "Log in to continue your PCOD wellness journey." : "Built by a teen with PCOD, for teens with PCOD."}
            </p>

            {error && <div className="error-msg" style={{ animation:"shake 0.4s ease forwards" }}>{error}</div>}
            {success && <div className="success-msg" style={{ animation:"dropDown 0.3s ease forwards" }}>{success}</div>}

            {mode === "signup" && (
              <div className="form-group" style={{ animation: formVisible ? "dropDown 0.6s ease 0.3s both" : "none", opacity:0, animationFillMode:"both" }}>
                <label className="form-label">Your name</label>
                <input className="form-input auth-input-glow" type="text" placeholder="e.g. Aisha" value={name} onChange={e => setName(e.target.value)}/>
              </div>
            )}

            <div className="form-group" style={{ animation: formVisible ? "dropDown 0.6s ease 0.35s both" : "none", opacity:0, animationFillMode:"both" }}>
              <label className="form-label">Email address</label>
              <input className="form-input auth-input-glow" type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)}/>
            </div>

            <div className="form-group" style={{ animation: formVisible ? "dropDown 0.6s ease 0.4s both" : "none", opacity:0, animationFillMode:"both" }}>
              <label className="form-label">Password</label>
              <input className="form-input auth-input-glow" type="password" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()}/>
            </div>

            <div style={{ animation: formVisible ? "dropDown 0.6s ease 0.45s both" : "none", opacity:0, animationFillMode:"both" }}>
              <button className="btn-primary auth-btn-glow" onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                    <span style={{ width:16, height:16, border:"2px solid rgba(255,255,255,0.4)", borderTopColor:"white", borderRadius:"50%", display:"inline-block", animation:"spin 0.8s linear infinite" }}/>
                    Please wait...
                  </span>
                ) : mode === "login" ? "Log in →" : "Create account →"}
              </button>
            </div>

            <div className="auth-switch" style={{ animation: formVisible ? "dropDown 0.6s ease 0.5s both" : "none", opacity:0, animationFillMode:"both" }}>
              {mode === "login" ? (
                <>Don't have an account? <button onClick={() => { setMode("signup"); setError(""); setSuccess(""); }}>Sign up free</button></>
              ) : (
                <>Already have an account? <button onClick={() => { setMode("login"); setError(""); setSuccess(""); }}>Log in</button></>
              )}
            </div>

            <div style={{ marginTop:32, padding:"16px", background:"var(--purple-50)", borderRadius:"var(--radius-md)", textAlign:"center", animation: formVisible ? "dropDown 0.6s ease 0.55s both" : "none", opacity:0, animationFillMode:"both" }}>
              <p style={{ fontSize:13, color:"var(--purple-600)", lineHeight:1.6 }}>
                💜 Your data is private and secure. HerRhythm never shares your health information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}