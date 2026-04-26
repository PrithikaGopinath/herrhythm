import { useState } from "react";

const articles = [
  {
    id: 1,
    icon: "🔬",
    color: "#EEEDFE",
    title: "What is PCOD?",
    subtitle: "A plain-English explainer — no jargon.",
    content: `<h3>So, what actually is PCOD?</h3><p>PCOD stands for Polycystic Ovarian Disease. It's a condition where your ovaries produce more androgens (male hormones) than usual. This can affect your periods, your skin, your hair, and how your body uses energy.</p><div class="learn-highlight">1 in 10 women worldwide has PCOD — you are absolutely not alone.</div><h3>What causes it?</h3><p>The exact cause isn't fully understood, but PCOD is linked to insulin resistance, inflammation, and genetics. It often runs in families.</p><h3>Common signs</h3><p>Irregular or missed periods, acne, excess facial/body hair, hair thinning, weight gain around the belly, and fatigue are all common with PCOD.</p><h3>Can it be cured?</h3><p>PCOD can't be cured, but it can be managed really well. Lifestyle changes can significantly reduce symptoms and help you feel like yourself again.</p><div class="learn-highlight">You are not broken. Your body just works differently, and you can work with it.</div>`,
  },
  {
    id: 2,
    icon: "🥗",
    color: "#FBEAF0",
    title: "Food & insulin resistance",
    subtitle: "How what you eat affects your hormones.",
    content: `<h3>Why does food matter so much with PCOD?</h3><p>Most people with PCOD have insulin resistance — your cells don't respond to insulin well. This causes your body to produce more insulin, which triggers more androgens. That's where many PCOD symptoms come from.</p><div class="learn-highlight">Eating in a way that keeps your blood sugar stable is one of the most powerful things you can do for your PCOD.</div><h3>Foods that help</h3><p>Low GI foods release sugar slowly — brown rice, whole grain bread, oats, lentils, vegetables, berries, nuts, eggs, fish, and chicken.</p><h3>Foods to limit</h3><p>High GI foods spike your blood sugar — white rice, white bread, sugary drinks, sweets, and processed snacks.</p><div class="learn-highlight">You don't need a perfect diet. Small consistent swaps make a real difference over time.</div>`,
  },
  {
    id: 3,
    icon: "🏃‍♀️",
    color: "#E1F5EE",
    title: "Exercise & PCOD",
    subtitle: "Why movement is one of your best tools.",
    content: `<h3>Why exercise helps PCOD</h3><p>Exercise improves insulin sensitivity — meaning your cells respond to insulin better. This directly reduces the hormonal imbalance that causes PCOD symptoms.</p><div class="learn-highlight">Even a 30-minute walk 5 times a week is genuinely powerful for PCOD.</div><h3>Best types of exercise</h3><p>Strength training is particularly effective because it builds muscle and improves insulin sensitivity. Cardio like walking, cycling, and swimming also helps.</p><h3>What about yoga?</h3><p>Yoga reduces cortisol, improves hormonal balance, and can help with irregular periods. Even 20 minutes daily has been shown to help.</p><div class="learn-highlight">Consistency beats intensity. Moving a little every day is better than intense workouts once a week.</div>`,
  },
  {
    id: 4,
    icon: "🧠",
    color: "#FAEEDA",
    title: "Stress & your hormones",
    subtitle: "The cortisol-PCOD connection explained.",
    content: `<h3>What is cortisol?</h3><p>Cortisol is your body's main stress hormone. Chronic high cortisol is really problematic for PCOD.</p><div class="learn-highlight">High cortisol makes insulin resistance worse, raises androgen levels, and disrupts your period. Managing stress is genuinely medical for PCOD.</div><h3>What helps</h3><p>Sleep, gentle exercise, deep breathing, journaling, time in nature, reducing caffeine, and setting boundaries on things that drain you.</p><div class="learn-highlight">Rest is not laziness. For someone with PCOD, prioritising rest is a health decision.</div>`,
  },
  {
    id: 5,
    icon: "😴",
    color: "#EEEDFE",
    title: "Sleep & PCOD",
    subtitle: "Why quality sleep is non-negotiable.",
    content: `<h3>Sleep and hormones are deeply connected</h3><p>Poor sleep raises cortisol, increases insulin resistance, and disrupts hormones that regulate your appetite and cycle.</p><div class="learn-highlight">Aim for 7–9 hours of sleep. For PCOD, this is one of the most impactful things you can do.</div><h3>Tips for better sleep</h3><p>Keep a consistent sleep schedule, avoid screens 30 minutes before bed, keep your room cool and dark, limit caffeine after 2pm, and try a short wind-down routine.</p><div class="learn-highlight">A good night's sleep is self-care AND medical care when you have PCOD.</div>`,
  },
];

export default function Learn() {
  const [selected, setSelected] = useState(null);

  if (selected)
    return (
      <div className="learn-detail">
        <button className="learn-detail-back" onClick={() => setSelected(null)}>
          ← Back to Learn
        </button>
        <div style={{ fontSize: 40, marginBottom: 12 }}>{selected.icon}</div>
        <h1 className="learn-detail-title">{selected.title}</h1>
        <div className="divider"></div>
        <div
          className="learn-detail-body"
          dangerouslySetInnerHTML={{ __html: selected.content }}
        />
      </div>
    );

  return (
    <div className="page">
      <h2 style={{ fontSize: 22, fontWeight: 500, marginBottom: 4 }}>
        Learn 📖
      </h2>
      <p
        style={{
          fontSize: 13,
          color: "var(--text-secondary)",
          marginBottom: 8,
        }}
      >
        Bite-sized PCOD guides for teens. No jargon, no scary stuff.
      </p>
      <div className="card card-purple" style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>
          Knowledge is power 💜
        </p>
        <p style={{ fontSize: 13, opacity: 0.9, lineHeight: 1.6 }}>
          Understanding PCOD helps you make better decisions for your body every
          single day.
        </p>
      </div>
      <div className="card" style={{ padding: "4px 18px" }}>
        {articles.map((a) => (
          <div key={a.id} className="learn-card" onClick={() => setSelected(a)}>
            <div className="learn-icon" style={{ background: a.color }}>
              {a.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div className="learn-title">{a.title}</div>
              <div className="learn-sub">{a.subtitle}</div>
            </div>
            <div className="learn-arrow">›</div>
          </div>
        ))}
      </div>
      <div
        className="card card-pink"
        style={{ marginTop: 14, textAlign: "center" }}
      >
        <p
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "var(--pink-800)",
            marginBottom: 6,
          }}
        >
          Remember 🌸
        </p>
        <p style={{ fontSize: 13, color: "var(--pink-600)", lineHeight: 1.7 }}>
          HerRhythm is for education and lifestyle support — not medical
          diagnosis. Always talk to your doctor about your PCOD treatment.
        </p>
      </div>
    </div>
  );
}
