import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import "./index.css";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Log from "./pages/Log";
import Insights from "./pages/Insights";
import Cycle from "./pages/Cycle";
import Learn from "./pages/Learn";
import Chat from "./pages/Chat";
import DoctorPrep from "./pages/DoctorPrep";
import Community from "./pages/Community";

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState("home");
  const [showProfile, setShowProfile] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pageKey, setPageKey] = useState(0);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

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

  useEffect(() => {
    if (!session) return;
    const buildNotifications = async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data: logs } = await supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", session.user.id)
        .order("log_date", { ascending: false })
        .limit(7);
      const { data: cycle } = await supabase
        .from("cycle_logs")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      const notifs = [];
      const todayLogged = logs?.some((l) => l.log_date === today);

      if (!todayLogged) {
        notifs.push({
          id: 1,
          icon: "📝",
          title: "Log your day",
          message: "You haven't logged today yet. It only takes 2 minutes!",
          action: "log",
          unread: true,
        });
      } else {
        notifs.push({
          id: 2,
          icon: "✅",
          title: "Logged today!",
          message: "Great job logging today. Check your AI insights!",
          action: "insights",
          unread: false,
        });
      }
      if (logs && logs.length >= 3) {
        notifs.push({
          id: 3,
          icon: "✨",
          title: "Insights ready",
          message: `You have ${logs.length} logs — your AI insights are ready to view.`,
          action: "insights",
          unread: true,
        });
      }
      if (!cycle || !cycle.period_days || cycle.period_days.length === 0) {
        notifs.push({
          id: 4,
          icon: "🌸",
          title: "Update your cycle",
          message: "Track your period days for better PCOD insights.",
          action: "cycle",
          unread: true,
        });
      }
      const tips = [
        "💧 Drink 8 glasses of water today — hydration helps with PCOD bloating.",
        "😴 Try to get to bed 30 mins earlier tonight — sleep is medicine for PCOD.",
        "🥗 Swap one refined carb today for a whole grain — your hormones will thank you.",
        "🏃‍♀️ Even a 20 min walk today can improve your insulin sensitivity.",
        "🧘‍♀️ Take 5 deep breaths — stress management is key for PCOD.",
      ];
      notifs.push({
        id: 5,
        icon: "💜",
        title: "Daily PCOD tip",
        message: tips[new Date().getDay() % tips.length],
        action: null,
        unread: true,
      });
      setNotifications(notifs);
      setUnreadCount(notifs.filter((n) => n.unread).length);
    };
    buildNotifications();
  }, [session]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setShowProfile(false);
  };
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
    setShowProfile(false);
  };

  const handleNotificationClick = (notif) => {
    if (notif.action) {
      setActivePage(notif.action);
      setPageKey((k) => k + 1);
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, unread: false } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    setShowNotifications(false);
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    setUnreadCount(0);
  };

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "var(--bg-primary)",
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
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
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
    chat: <Chat session={session} />,
    doctor: <DoctorPrep session={session} />,
    community: <Community session={session} />,
  };

  const navItems = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "log", label: "Log", icon: "📝" },
    { id: "insights", label: "Insights", icon: "✨" },
    { id: "cycle", label: "Cycle", icon: "🌸" },
    { id: "learn", label: "Learn", icon: "📖" },
    { id: "chat", label: "Rhya", icon: "💬" },
    { id: "doctor", label: "Dr Prep", icon: "🩺" },
    { id: "community", label: "Community", icon: "👭" },
  ];

  return (
    <div
      className="app"
      onClick={() => {
        setShowProfile(false);
        setShowNotifications(false);
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
        @keyframes pageEnter {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes notifSlideIn {
          from { opacity: 0; transform: translateX(12px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <div className="top-nav" onClick={(e) => e.stopPropagation()}>
        <span className="nav-logo">HerRhythm</span>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Notification Bell */}
          <div style={{ position: "relative" }}>
            <div
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfile(false);
              }}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "var(--bg-secondary)",
                border: "1.5px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: 16,
                position: "relative",
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.1)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              🔔
              {unreadCount > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -4,
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "var(--pink-400)",
                    color: "white",
                    fontSize: 10,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    animation: "popIn 0.3s ease forwards",
                  }}
                >
                  {unreadCount}
                </div>
              )}
            </div>

            {showNotifications && (
              <div
                style={{
                  position: "absolute",
                  top: 44,
                  right: 0,
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-lg)",
                  boxShadow: "var(--shadow-card)",
                  width: 300,
                  zIndex: 30,
                  overflow: "hidden",
                  animation: "pageEnter 0.25s ease forwards",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "14px 16px",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: "var(--text-primary)",
                    }}
                  >
                    Notifications
                  </p>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: 12,
                        color: "var(--purple-600)",
                        cursor: "pointer",
                        fontFamily: "DM Sans, sans-serif",
                        fontWeight: 500,
                      }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {notifications.map((notif, i) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      padding: "12px 16px",
                      borderBottom:
                        i < notifications.length - 1
                          ? "1px solid var(--border)"
                          : "none",
                      background: notif.unread
                        ? "var(--purple-50)"
                        : "var(--bg-primary)",
                      cursor: notif.action ? "pointer" : "default",
                      transition: "background 0.15s",
                      animation: `notifSlideIn 0.3s ease ${i * 0.07}s forwards`,
                      opacity: 0,
                      animationFillMode: "both",
                    }}
                  >
                    <span style={{ fontSize: 20, flexShrink: 0 }}>
                      {notif.icon}
                    </span>
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: notif.unread ? 500 : 400,
                          color: "var(--text-primary)",
                          marginBottom: 2,
                        }}
                      >
                        {notif.title}
                      </p>
                      <p
                        style={{
                          fontSize: 12,
                          color: "var(--text-secondary)",
                          lineHeight: 1.5,
                        }}
                      >
                        {notif.message}
                      </p>
                    </div>
                    {notif.unread && (
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: "var(--purple-400)",
                          flexShrink: 0,
                          marginTop: 4,
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Profile Avatar */}
          <div style={{ position: "relative" }}>
            <div
              className="nav-avatar"
              onClick={() => {
                setShowProfile(!showProfile);
                setShowNotifications(false);
              }}
              style={{ transition: "transform 0.2s ease" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.1)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              {userInitial}
            </div>
            {showProfile && (
              <div
                className="profile-menu"
                style={{ animation: "pageEnter 0.25s ease forwards" }}
              >
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
                <div className="profile-menu-item" onClick={toggleTheme}>
                  {theme === "light" ? "🌙 Dark mode" : "☀️ Light mode"}
                </div>
                <div className="divider" style={{ margin: "4px 0" }}></div>
                <div
                  className="profile-menu-item danger"
                  onClick={handleSignOut}
                >
                  Sign out
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Page with transition */}
      <div
        key={`${activePage}-${pageKey}`}
        style={{ animation: "pageEnter 0.35s ease forwards" }}
      >
        {pages[activePage]}
      </div>

      <div className="bottom-nav">
        {navItems.map((item) => (
          <div
            key={item.id}
            className={`bnav-item ${activePage === item.id ? "active" : ""}`}
            onClick={() => {
              setActivePage(item.id);
              setPageKey((k) => k + 1);
              setShowProfile(false);
              setShowNotifications(false);
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
