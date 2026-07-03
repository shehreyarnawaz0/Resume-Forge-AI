import { useResume } from '../context/ResumeContext'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Dashboard() {
  const { savedResumes, deleteResume, loadSavedResume, scanHistory } = useResume()

  const avgScore = scanHistory.length > 0
    ? Math.round(scanHistory.reduce((a, s) => a + s.score, 0) / scanHistory.length)
    : 0

  const topMissing = ['TypeScript', 'Docker', 'AWS', 'Kubernetes', 'CI/CD']

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '2rem' }}>
        <div className="badge badge-purple" style={{ marginBottom: '0.75rem' }}>📊 Dashboard</div>
        <h1 className="section-title">Your Dashboard</h1>
        <p className="section-sub">Track your resumes, scan history, and analytics in one place.</p>
      </div>

      {/* Stats Row */}
      <div className="stats-grid" style={{ marginTop: 0, marginBottom: '2rem' }}>
        <div className="stat-card glass-card">
          <div className="stat-number gradient-text">{savedResumes.length}</div>
          <div className="stat-label">Saved Resumes</div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-number gradient-text">{scanHistory.length}</div>
          <div className="stat-label">Total Scans</div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-number gradient-text">{avgScore || '—'}</div>
          <div className="stat-label">Avg ATS Score</div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-number gradient-text">{scanHistory.filter(s => s.score >= 70).length}</div>
          <div className="stat-label">High Scores (70+)</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
        {/* Saved Resumes */}
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>📄 My Resumes</h2>
          {savedResumes.length === 0 ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>No saved resumes yet.</p>
              <Link to="/builder" className="btn-primary">Start Building →</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {savedResumes.map((r, i) => (
                <motion.div
                  key={r.id}
                  className="glass-card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>{r.name}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Created {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn-secondary"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                      onClick={() => loadSavedResume(r.id)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btn-secondary"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderColor: 'rgba(239,68,68,0.3)' }}
                      onClick={() => deleteResume(r.id)}
                    >
                      🗑
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Analytics Side */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Scan History */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h4 style={{ marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>📈 Recent Scans</h4>
            {scanHistory.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No scans yet. Go to Scanner to analyze your resume.</p>
            ) : (
              scanHistory.slice(0, 8).map((s, i) => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: i < Math.min(scanHistory.length - 1, 7) ? '1px solid var(--border)' : 'none', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '55%' }}>{s.fileName}</span>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: s.score >= 70 ? '#10b981' : s.score >= 50 ? '#f59e0b' : '#ef4444' }}>{s.score}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(s.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Score Distribution */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h4 style={{ marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🏆 Score Distribution</h4>
            {[
              { label: '90-100', count: scanHistory.filter(s => s.score >= 90).length, color: '#10b981' },
              { label: '70-89', count: scanHistory.filter(s => s.score >= 70 && s.score < 90).length, color: '#06b6d4' },
              { label: '50-69', count: scanHistory.filter(s => s.score >= 50 && s.score < 70).length, color: '#f59e0b' },
              { label: '0-49', count: scanHistory.filter(s => s.score < 50).length, color: '#ef4444' },
            ].map((d, i) => {
              const max = Math.max(1, ...scanHistory.map(() => 1), d.count)
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', width: 45, textAlign: 'right' }}>{d.label}</span>
                  <div style={{ flex: 1, height: 12, borderRadius: 6, background: 'rgba(255,255,255,0.05)' }}>
                    <div style={{ height: '100%', width: `${(d.count / max) * 100}%`, minWidth: d.count > 0 ? 8 : 0, borderRadius: 6, background: d.color, transition: 'width 0.5s ease' }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: d.color, width: 20 }}>{d.count}</span>
                </div>
              )
            })}
          </div>

          {/* Quick Actions */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h4 style={{ marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>⚡ Quick Actions</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link to="/builder" className="btn-secondary" style={{ justifyContent: 'center' }}>📝 New Resume</Link>
              <Link to="/scanner" className="btn-secondary" style={{ justifyContent: 'center' }}>🔍 Scan Resume</Link>
              <Link to="/matcher" className="btn-secondary" style={{ justifyContent: 'center' }}>🎯 Match a Job</Link>
              <Link to="/job-tracker" className="btn-secondary" style={{ justifyContent: 'center' }}>💼 Track Jobs</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
