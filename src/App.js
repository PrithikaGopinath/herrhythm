import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import "./index.css";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Log from "./pages/Log";
import Insights from "./pages/Insights";
import Cycle from "./pages/Cycle";
import Learn from "./pages/Learn";

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState("home");
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setShowProfile(false);
  };

  if (loading)
    return (
      <div
        className="app"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "Playfair Display, serif",
              fontSize: 32,
              color: "#3C3489",
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            HerRhythm
          </div>
          <div className="loading-spinner" style={{ margin: "0 auto" }}></div>
        </div>
      </div>
    );

  if (!session)
    return (
      <div className="app">
        <Auth />
      </div>
    );

  const userInitial = session.user.email?.[0]?.toUpperCase() || "U";
  const userEmail = session.user.email || "";

  const pages = {
    home: <Home session={session} setActivePage={setActivePage} />,
    log: <Log session={session} />,
    insights: <Insights session={session} />,
    cycle: <Cycle session={session} />,
    learn: <Learn />,
  };

  const navItems = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "log", label: "Log", icon: "📝" },
    { id: "insights", label: "Insights", icon: "✨" },
    { id: "cycle", label: "Cycle", icon: "🌸" },
    { id: "learn", label: "Learn", icon: "📖" },
  ];

  return (
    <div className="app">
      <div className="top-nav">
        <span className="nav-logo">HerRhythm</span>
        <div style={{ position: "relative" }}>
          <div
            className="nav-avatar"
            onClick={() => setShowProfile(!showProfile)}
          >
            {userInitial}
          </div>
          {showProfile && (
            <div className="profile-menu">
              <div
                className="profile-menu-item"
                style={{
                  fontSize: 12,
                  color: "var(--text-secondary)",
                  cursor: "default",
                }}
              >
                {userEmail}
              </div>
              <div className="divider" style={{ margin: "4px 0" }}></div>
              <div className="profile-menu-item danger" onClick={handleSignOut}>
                Sign out
              </div>
            </div>
          )}
        </div>
      </div>

      <div onClick={() => setShowProfile(false)}>{pages[activePage]}</div>

      <div className="bottom-nav">
        {navItems.map((item) => (
          <div
            key={item.id}
            className={`bnav-item ${activePage === item.id ? "active" : ""}`}
            onClick={() => {
              setActivePage(item.id);
              setShowProfile(false);
            }}
          >
            <span className="bnav-icon-wrap">{item.icon}</span>
            <span className="bnav-label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
