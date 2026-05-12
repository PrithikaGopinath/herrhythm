import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function Home({ session, setActivePage }) {
  const [todayLogged, setTodayLogged] = useState(false)
  const [, setLogCount] = useState(0)
  const [count, setCount] = useState(0)
  const [mounted, setMounted] = useState(false)

  const name = session.user.user_metadata?.full_name?.split(' ')[0] || session.user.email?.split('@')[0] || 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  useEffect(() => {
    setTimeout(() => setMounted(true), 50)
  }, [])

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', session.user.id)
        .order('log_date', { ascending: false })
        .limit(7)
      if (data) {
        setLogCount(data.length)
        const today = new Date().toISOString().split('T')[0]
        setTodayLogged(data.some(l => l.log_date === today))
        let start = 0
        const end = data.length
        if (end > 0) {
          const timer = setInterval(() => {
            start++
            setCount(start)
            if (start === end) clearInterval(timer)
          }, 120)
          return () => clearInterval(timer)
        }
      }
    }
    fetchLogs()
  }, [session.user.id])

  const tips = [
    { icon: '🥗', text: 'Low GI foods help manage insulin resistance with PCOD.' },
    { icon: '😴', text: 'Aim for 7–9 hours sleep — poor sleep raises cortisol and worsens PCOD.' },
    { icon: '🏃‍♀️', text: 'Even a 30 min walk daily can significantly improve PCOD symptoms.' },
    { icon: '💧', text: 'Staying hydrated supports hormone balance and reduces bloating.' },
  ]
  const dailyTip = tips[new Date().getDay() % tips.length]

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
        .quick-link-card { transition: all 0.2s ease !important; }
        .quick-link-card:hover {
          transform: translateY(-4px) !important;
          box-shadow: 0 8px 24px rgba(127,119,221,0.15) !important;
        }
        .hero-btn-home { transition: all 0.2s ease !important; }
        .hero-btn-home:hover {
          transform: scale(1.03) !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
        }
      `}</style>

      <p className="greeting" style={{
        opacity: mounted ? 1 : 0,
        animation: mounted ? 'fadeSlideUp 0.4s ease 0.05s forwards' : 'none',
        animationFillMode: 'both',
      }}>{greeting},</p>

      <p className="greeting-name" style={{
        opacity: mounted ? 1 : 0,
        animation: mounted ? 'fadeSlideUp 0.4s ease 0.1s forwards' : 'none',
        animationFillMode: 'both',
      }}>{name} 💜</p>

      <div className="hero-card" style={{
        opacity: mounted ? 1 : 0,
        animation: mounted ? 'fadeSlideUp 0.5s ease 0.15s forwards' : 'none',
        animationFillMode: 'both',
      }}>
        <h2>{todayLogged ? "Great job logging today!" : "Ready to log your day?"}</h2>
        <p>
          {todayLogged
            ? "Your log is in. Check your AI insights to see what your body is telling you."
            : "Track your sleep, food, stress and symptoms. Get personalised PCOD tips."}
        </p>
        <button className="hero-btn hero-btn-home" onClick={() => setActivePage(todayLogged ? 'insights' : 'log')}>
          {todayLogged ? 'View my insights →' : "Start today's log →"}
        </button>
      </div>

      <div className="stats-row" style={{
        opacity: mounted ? 1 : 0,
        animation: mounted ? 'fadeSlideUp 0.5s ease 0.2s forwards' : 'none',
        animationFillMode: 'both',
      }}>
        <div className="stat-card">
          <div className="stat-num" style={{ animation: 'popIn 0.4s ease 0.4s forwards', opacity: 0, animationFillMode: 'both' }}>
            {count}
          </div>
          <div className="stat-label">Days logged this week</div>
        </div>
        <div className="stat-card">
          <div className="stat-num" style={{ animation: 'popIn 0.4s ease 0.5s forwards', opacity: 0, animationFillMode: 'both' }}>
            {todayLogged ? '✓' : '—'}
          </div>
          <div className="stat-label">Today's log</div>
        </div>
      </div>

      <p className="section-title" style={{
        opacity: mounted ? 1 : 0,
        animation: mounted ? 'fadeSlideUp 0.4s ease 0.25s forwards' : 'none',
        animationFillMode: 'both',
      }}>Today's PCOD tip</p>

      <div className="card card-lavender" style={{
        display: 'flex', gap: 12, alignItems: 'flex-start',
        opacity: mounted ? 1 : 0,
        animation: mounted ? 'fadeSlideUp 0.4s ease 0.3s forwards' : 'none',
        animationFillMode: 'both',
      }}>
        <span style={{ fontSize: 28 }}>{dailyTip.icon}</span>
        <p style={{ fontSize: 15, color: 'var(--purple-900)', lineHeight: 1.7, margin: 0 }}>{dailyTip.text}</p>
      </div>

      <p className="section-title">Track with HerRhythm</p>
      <div className="pill-row">
        {['Sleep', 'Food', 'Exercise', 'Stress', 'Mood', 'Symptoms', 'Cycle'].map(t => (
          <span key={t} className={`pill ${['Sleep', 'Exercise', 'Mood'].includes(t) ? 'pill-purple' : 'pill-pink'}`}
            style={{ transition: 'transform 0.15s ease', cursor: 'default' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >{t}</span>
        ))}
      </div>

      <p className="section-title">Quick links</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[
          { icon: '✨', label: 'AI insights', page: 'insights' },
          { icon: '🌸', label: 'Cycle tracker', page: 'cycle' },
          { icon: '📖', label: 'Learn about PCOD', page: 'learn' },
          { icon: '📝', label: 'Daily log', page: 'log' },
        ].map((item, i) => (
          <div
            key={item.page}
            className="card quick-link-card"
            style={{
              cursor: 'pointer', textAlign: 'center', padding: 16,
              opacity: mounted ? 1 : 0,
              animation: mounted ? `fadeSlideUp 0.4s ease ${0.35 + i * 0.08}s forwards` : 'none',
              animationFillMode: 'both',
            }}
            onClick={() => setActivePage(item.page)}
          >
            <div style={{ fontSize: 26, marginBottom: 6 }}>{item.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}