import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const topics = [
  { id: "general", label: "General", icon: "💜" },
  { id: "periods", label: "Periods", icon: "🌸" },
  { id: "food", label: "Food & Diet", icon: "🥗" },
  { id: "mental-health", label: "Mental Health", icon: "🧠" },
  { id: "newly-diagnosed", label: "Newly Diagnosed", icon: "🌱" },
  { id: "exercise", label: "Exercise", icon: "🏃‍♀️" },
  { id: "wins", label: "Wins & Positivity", icon: "🎉" },
];

export default function Community({ session }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [activeTopic, setActiveTopic] = useState("general");
  const [showNewPost, setShowNewPost] = useState(false);
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [username, setUsername] = useState("");
  const [heartedPosts, setHeartedPosts] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const defaultUsername =
    session.user.user_metadata?.full_name?.split(" ")[0] ||
    session.user.email?.split("@")[0] ||
    "Anonymous";

  useEffect(() => {
    setUsername(defaultUsername);
  }, [defaultUsername]);

  useEffect(() => {
    fetchPosts();
    fetchHearts();
  }, [activeTopic]);

  const fetchPosts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("community_posts")
      .select("*")
      .eq("topic", activeTopic)
      .order("created_at", { ascending: false })
      .limit(50);
    setPosts(data || []);
    setLoading(false);
  };

  const fetchHearts = async () => {
    const { data } = await supabase
      .from("post_hearts")
      .select("post_id")
      .eq("user_id", session.user.id);
    setHeartedPosts(data?.map((h) => h.post_id) || []);
  };

  const handlePost = async () => {
    if (!content.trim()) return;
    if (content.length > 500) {
      setError("Post must be under 500 characters");
      return;
    }
    setPosting(true);
    setError("");

    const { error } = await supabase.from("community_posts").insert([
      {
        user_id: session.user.id,
        username: isAnonymous ? "Anonymous" : username,
        content: content.trim(),
        topic: activeTopic,
        is_anonymous: isAnonymous,
        hearts: 0,
      },
    ]);

    if (error) setError("Could not post. Please try again.");
    else {
      setContent("");
      setShowNewPost(false);
      setSuccess("Posted! 💜");
      fetchPosts();
      setTimeout(() => setSuccess(""), 3000);
    }
    setPosting(false);
  };

  const handleHeart = async (post) => {
    const alreadyHearted = heartedPosts.includes(post.id);

    if (alreadyHearted) {
      await supabase
        .from("post_hearts")
        .delete()
        .eq("user_id", session.user.id)
        .eq("post_id", post.id);
      await supabase
        .from("community_posts")
        .update({ hearts: Math.max(0, post.hearts - 1) })
        .eq("id", post.id);
      setHeartedPosts((prev) => prev.filter((id) => id !== post.id));
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id ? { ...p, hearts: Math.max(0, p.hearts - 1) } : p,
        ),
      );
    } else {
      await supabase
        .from("post_hearts")
        .insert([{ user_id: session.user.id, post_id: post.id }]);
      await supabase
        .from("community_posts")
        .update({ hearts: post.hearts + 1 })
        .eq("id", post.id);
      setHeartedPosts((prev) => [...prev, post.id]);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id ? { ...p, hearts: p.hearts + 1 } : p,
        ),
      );
    }
  };

  const handleDelete = async (postId) => {
    await supabase
      .from("community_posts")
      .delete()
      .eq("id", postId)
      .eq("user_id", session.user.id);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const activeTopic_ = topics.find((t) => t.id === activeTopic);

  return (
    <div className="page">
      <h2 style={{ fontSize: 22, fontWeight: 500, marginBottom: 4 }}>
        Community 🌸
      </h2>
      <p
        style={{
          fontSize: 13,
          color: "var(--text-secondary)",
          marginBottom: 16,
        }}
      >
        A safe space for girls with PCOD — share, support, and connect.
      </p>

      {success && <div className="success-msg">{success}</div>}
      {error && <div className="error-msg">{error}</div>}

      {/* Topics */}
      <div
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          paddingBottom: 12,
          marginBottom: 16,
          scrollbarWidth: "none",
        }}
      >
        {topics.map((t) => (
          <div
            key={t.id}
            onClick={() => setActiveTopic(t.id)}
            style={{
              padding: "7px 14px",
              borderRadius: 20,
              fontSize: 13,
              fontWeight: activeTopic === t.id ? 500 : 400,
              background:
                activeTopic === t.id
                  ? "var(--purple-400)"
                  : "var(--bg-secondary)",
              color: activeTopic === t.id ? "white" : "var(--text-secondary)",
              border: `1.5px solid ${activeTopic === t.id ? "var(--purple-400)" : "var(--border)"}`,
              cursor: "pointer",
              transition: "all 0.15s",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {t.icon} {t.label}
          </div>
        ))}
      </div>

      {/* New post button */}
      {!showNewPost ? (
        <div
          onClick={() => setShowNewPost(true)}
          className="card"
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 18px",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "var(--purple-50)",
              border: "1.5px solid var(--purple-100)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            {isAnonymous ? "🎭" : userInitial(username)}
          </div>
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
            Share something with the community...
          </p>
        </div>
      ) : (
        <div className="card" style={{ marginBottom: 16 }}>
          <p
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "var(--text-primary)",
              marginBottom: 12,
            }}
          >
            New post in {activeTopic_.icon} {activeTopic_.label}
          </p>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your experience, ask a question, or offer support..."
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
              minHeight: 100,
              marginBottom: 12,
            }}
            maxLength={500}
          />
          <p
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              marginBottom: 12,
              textAlign: "right",
            }}
          >
            {content.length}/500
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 14,
            }}
          >
            <div
              onClick={() => setIsAnonymous(!isAnonymous)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
                padding: "6px 12px",
                borderRadius: 20,
                background: isAnonymous
                  ? "var(--purple-50)"
                  : "var(--bg-secondary)",
                border: `1.5px solid ${isAnonymous ? "var(--purple-100)" : "var(--border)"}`,
                fontSize: 13,
                color: isAnonymous
                  ? "var(--purple-600)"
                  : "var(--text-secondary)",
              }}
            >
              🎭 {isAnonymous ? "Posting anonymously" : "Post anonymously"}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn-primary"
              onClick={handlePost}
              disabled={posting || !content.trim()}
              style={{ flex: 1 }}
            >
              {posting ? "Posting..." : "Post 💜"}
            </button>
            <button
              className="btn-secondary"
              onClick={() => {
                setShowNewPost(false);
                setContent("");
              }}
              style={{ flex: 1, marginTop: 0 }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Safety notice */}
      <div
        style={{
          background: "var(--pink-50)",
          border: "1px solid var(--pink-100)",
          borderRadius: "var(--radius-md)",
          padding: "10px 14px",
          marginBottom: 16,
          display: "flex",
          gap: 8,
          alignItems: "flex-start",
        }}
      >
        <span style={{ fontSize: 14, flexShrink: 0 }}>🛡️</span>
        <p style={{ fontSize: 12, color: "var(--pink-600)", lineHeight: 1.6 }}>
          This is a safe, supportive space. Be kind, be supportive. HerRhythm is
          not a substitute for medical advice.
        </p>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="loading-insights">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div
          className="card card-lavender"
          style={{ textAlign: "center", padding: 32 }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>🌱</div>
          <p
            style={{
              fontWeight: 500,
              color: "var(--purple-800)",
              marginBottom: 8,
            }}
          >
            No posts yet
          </p>
          <p
            style={{
              fontSize: 13,
              color: "var(--purple-600)",
              lineHeight: 1.6,
            }}
          >
            Be the first to share something in {activeTopic_.label}!
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {posts.map((post) => (
            <div
              key={post.id}
              className="card"
              style={{ padding: "16px 18px" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "var(--purple-50)",
                      border: "1.5px solid var(--purple-100)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      fontWeight: 500,
                      color: "var(--purple-600)",
                    }}
                  >
                    {post.is_anonymous ? "🎭" : userInitial(post.username)}
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "var(--text-primary)",
                      }}
                    >
                      {post.username}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {timeAgo(post.created_at)}
                    </p>
                  </div>
                </div>
                {post.user_id === session.user.id && (
                  <button
                    onClick={() => handleDelete(post.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 12,
                      color: "var(--text-muted)",
                      fontFamily: "DM Sans, sans-serif",
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>

              <p
                style={{
                  fontSize: 14,
                  color: "var(--text-primary)",
                  lineHeight: 1.7,
                  marginBottom: 12,
                }}
              >
                {post.content}
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button
                  onClick={() => handleHeart(post)}
                  style={{
                    background: heartedPosts.includes(post.id)
                      ? "var(--pink-50)"
                      : "var(--bg-secondary)",
                    border: `1.5px solid ${heartedPosts.includes(post.id) ? "var(--pink-100)" : "var(--border)"}`,
                    borderRadius: 20,
                    padding: "5px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    fontFamily: "DM Sans, sans-serif",
                  }}
                >
                  <span style={{ fontSize: 14 }}>
                    {heartedPosts.includes(post.id) ? "💜" : "🤍"}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: heartedPosts.includes(post.id)
                        ? "var(--pink-600)"
                        : "var(--text-secondary)",
                    }}
                  >
                    {post.hearts}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function userInitial(name) {
  return name?.[0]?.toUpperCase() || "?";
}
