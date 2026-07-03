import { useState } from 'react'
import { motion } from 'framer-motion'
import { useResume } from '../context/ResumeContext'
import { SkeletonCard } from '../components/LoadingSkeleton'

const techSkills = [
  'react', 'angular', 'vue', 'javascript', 'typescript', 'python', 'java', 'c++', 'c#',
  'node.js', 'nodejs', 'express', 'django', 'flask', 'spring', 'ruby', 'rails', 'go', 'golang',
  'rust', 'swift', 'kotlin', 'dart', 'flutter', 'react native', 'aws', 'azure', 'gcp', 'google cloud',
  'docker', 'kubernetes', 'k8s', 'terraform', 'jenkins', 'ci/cd', 'github actions', 'git',
  'sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'graphql', 'rest', 'rest api',
  'html', 'css', 'sass', 'tailwind', 'bootstrap', 'webpack', 'vite', 'next.js', 'nextjs',
  'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'nlp', 'computer vision',
  'data science', 'pandas', 'numpy', 'spark', 'hadoop', 'kafka', 'rabbitmq',
  'agile', 'scrum', 'jira', 'figma', 'photoshop', 'linux', 'bash', 'powershell',
]

const softSkills = [
  'leadership', 'communication', 'teamwork', 'problem-solving', 'critical thinking',
  'project management', 'time management', 'collaboration', 'mentoring', 'presentation',
]

const courseDb = {
  'react': { title: 'React – The Complete Guide', platform: 'Udemy', duration: '48h' },
  'typescript': { title: 'TypeScript for Professionals', platform: 'Udemy', duration: '12h' },
  'aws': { title: 'AWS Certified Solutions Architect', platform: 'AWS Training', duration: '20h' },
  'docker': { title: 'Docker & Kubernetes Masterclass', platform: 'Coursera', duration: '15h' },
  'kubernetes': { title: 'Kubernetes for Developers', platform: 'Linux Foundation', duration: '18h' },
  'python': { title: 'Python for Data Science', platform: 'edX', duration: '10h' },
  'node.js': { title: 'Node.js – Complete Guide', platform: 'Udemy', duration: '36h' },
  'postgresql': { title: 'PostgreSQL Mastery', platform: 'LinkedIn Learning', duration: '8h' },
  'mongodb': { title: 'MongoDB University Courses', platform: 'MongoDB', duration: '12h' },
  'graphql': { title: 'GraphQL by Example', platform: 'Udemy', duration: '6h' },
  'machine learning': { title: 'ML Specialization', platform: 'Coursera (Andrew Ng)', duration: '60h' },
  'ci/cd': { title: 'CI/CD with GitHub Actions', platform: 'GitHub Learning', duration: '5h' },
  'java': { title: 'Java Programming Masterclass', platform: 'Udemy', duration: '80h' },
  'terraform': { title: 'HashiCorp Terraform Associate', platform: 'HashiCorp', duration: '15h' },
  'figma': { title: 'UI/UX Design with Figma', platform: 'Coursera', duration: '20h' },
}

function extractSkillsFromJD(text) {
  const lower = text.toLowerCase()
  const found = []

  for (const skill of techSkills) {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
    if (regex.test(lower)) {
      found.push(skill.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '))
    }
  }

  return [...new Set(found)]
}

function extractKeyPhrases(text) {
  const phrases = []
  const patterns = [
    /(\d+)\+?\s*years?\s*(?:of\s*)?experience/gi,
    /(?:bachelor|master|phd|degree)\s*(?:in\s*)?[\w\s]+/gi,
    /(?:remote|hybrid|on-?site|full-?time|part-?time|contract)/gi,
    /(?:agile|scrum|kanban|waterfall)/gi,
    /(?:cross-functional|cross functional)/gi,
    /(?:scalable|distributed|microservices|monolith)/gi,
    /(?:startup|enterprise|fortune 500)/gi,
  ]

  patterns.forEach(p => {
    const matches = text.match(p)
    if (matches) phrases.push(...matches.map(m => m.trim()))
  })

  return [...new Set(phrases)].slice(0, 10)
}

function loadMatchHistory() {
  try {
    const saved = localStorage.getItem('rf-match-history')
    if (saved) return JSON.parse(saved)
  } catch {}
  return []
}

export default function Matcher() {
  const { resume, addSkill } = useResume()
  const [jd, setJd] = useState('')
  const [analyzed, setAnalyzed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [matchHistory, setMatchHistory] = useState(loadMatchHistory)
  const [addedSkills, setAddedSkills] = useState(new Set())

  const handleAnalyze = async () => {
    if (!jd.trim()) return
    setLoading(true)
    setAnalyzed(false)

    await new Promise(r => setTimeout(r, 1500))

    const jdSkills = extractSkillsFromJD(jd)
    const resumeSkills = resume.skills.map(s => s.toLowerCase())
    const matched = jdSkills.filter(s => resumeSkills.includes(s.toLowerCase()))
    const missing = jdSkills.filter(s => !resumeSkills.includes(s.toLowerCase()))
    const keyPhrases = extractKeyPhrases(jd)

    const matchScore = jdSkills.length > 0
      ? Math.round((matched.length / jdSkills.length) * 100)
      : 0

    const courses = missing
      .map(s => courseDb[s.toLowerCase()])
      .filter(Boolean)
      .slice(0, 5)

    const analysis = {
      matchScore,
      requiredSkills: jdSkills,
      matched,
      missing,
      keyPhrases,
      courses,
    }

    setResult(analysis)
    setAnalyzed(true)
    setLoading(false)

    // Save to history
    const entry = {
      id: Date.now(),
      preview: jd.slice(0, 100) + '...',
      matchScore,
      date: new Date().toISOString(),
      matchedCount: matched.length,
      totalSkills: jdSkills.length,
    }
    const updated = [entry, ...matchHistory].slice(0, 5)
    setMatchHistory(updated)
    localStorage.setItem('rf-match-history', JSON.stringify(updated))
  }

  const handleAddSkill = (skill) => {
    addSkill(skill)
    setAddedSkills(prev => new Set([...prev, skill]))
  }

  const scoreLabel = (s) => s >= 80 ? 'Excellent' : s >= 65 ? 'Good' : s >= 50 ? 'Moderate' : 'Low'

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '2rem' }}>
        <div className="badge badge-green" style={{ marginBottom: '0.75rem' }}>🎯 JD Matcher</div>
        <h1 className="section-title">Match Your Resume to a Job</h1>
        <p className="section-sub">Paste a job description to find skill gaps, extract keywords, and get course recommendations.</p>
      </div>

      <div className="matcher-layout">
        {/* Left: JD Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 className="form-section-title">📋 Paste Job Description</h3>
            <textarea
              className="glass-input"
              value={jd}
              onChange={e => setJd(e.target.value)}
              rows={14}
              placeholder={`Paste the full job description here...\n\nExample:\nWe are looking for a Senior Software Engineer with 5+ years of experience in React, TypeScript, Node.js, and AWS. The ideal candidate should have experience with Docker, CI/CD pipelines and PostgreSQL...`}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              {jd.length > 0 ? `${jd.split(/\s+/).filter(Boolean).length} words` : 'Paste a JD to begin'}
            </p>
          </div>

          <button
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={handleAnalyze}
            disabled={!jd.trim() || loading}
          >
            {loading ? '⏳ Analyzing...' : '🎯 Analyze Match'}
          </button>

          {/* Match History */}
          {matchHistory.length > 0 && (
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <h4 style={{ marginBottom: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>📜 Recent Matches</h4>
              {matchHistory.map((h, i) => (
                <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', borderRadius: 6, background: 'rgba(255,255,255,0.03)', marginBottom: '0.35rem', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>{h.preview}</span>
                  <span style={{ fontWeight: 700, color: h.matchScore >= 65 ? '#10b981' : '#f59e0b' }}>{h.matchScore}%</span>
                </div>
              ))}
            </div>
          )}

          {/* Your Skills */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h4 style={{ marginBottom: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>📌 Your Resume Skills</h4>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {resume.skills.length > 0 ? resume.skills.map(s => (
                <span key={s} className="badge badge-purple">{s}</span>
              )) : (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No skills in your resume yet. Add them in the Builder.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Results */}
        <div>
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <SkeletonCard height={130} />
              <SkeletonCard height={180} />
              <SkeletonCard height={100} />
              <SkeletonCard height={200} />
            </div>
          )}

          {!analyzed && !loading && (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎯</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Paste a job description and click <strong style={{ color: 'var(--text-secondary)' }}>Analyze Match</strong> to see skill gaps and recommendations.</p>
            </div>
          )}

          {analyzed && result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              {/* Score */}
              <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
                  <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                    <motion.circle
                      cx="50" cy="50" r="42" fill="none" stroke="url(#matchGrad)" strokeWidth="10"
                      strokeDasharray={`${2 * Math.PI * 42}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - result.matchScore / 100) }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="matchGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <motion.span
                      style={{ fontSize: '1.5rem', fontWeight: 800 }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      {result.matchScore}%
                    </motion.span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>match</span>
                  </div>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Match: <span style={{ color: result.matchScore >= 65 ? '#10b981' : '#f59e0b' }}>{scoreLabel(result.matchScore)}</span></h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    You match {result.matched.length} of {result.requiredSkills.length} required skills.
                    {result.missing.length > 0 && ' Close the gaps below!'}
                  </p>
                </div>
              </div>

              {/* Skills */}
              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <h4 style={{ marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Skill Analysis</h4>
                {result.matched.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.8rem', color: '#6ee7b7', marginBottom: '0.5rem', fontWeight: 600 }}>✅ Matched Skills ({result.matched.length})</p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {result.matched.map(s => <span key={s} className="badge badge-green">{s}</span>)}
                    </div>
                  </div>
                )}
                {result.missing.length > 0 && (
                  <div>
                    <p style={{ fontSize: '0.8rem', color: '#fca5a5', marginBottom: '0.5rem', fontWeight: 600 }}>❌ Missing Skills ({result.missing.length})</p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {result.missing.map(s => (
                        <button
                          key={s}
                          onClick={() => handleAddSkill(s)}
                          disabled={addedSkills.has(s)}
                          style={{
                            padding: '0.3rem 0.8rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600,
                            background: addedSkills.has(s) ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                            border: `1px solid ${addedSkills.has(s) ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                            color: addedSkills.has(s) ? '#6ee7b7' : '#fca5a5',
                            cursor: addedSkills.has(s) ? 'default' : 'pointer',
                            transition: 'all 0.2s',
                          }}
                        >
                          {addedSkills.has(s) ? `✅ ${s}` : `+ ${s}`}
                        </button>
                      ))}
                    </div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                      💡 Click a missing skill to add it to your resume
                    </p>
                  </div>
                )}
              </div>

              {/* Key Phrases */}
              {result.keyPhrases.length > 0 && (
                <div className="glass-card" style={{ padding: '1.25rem' }}>
                  <h4 style={{ marginBottom: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🔑 Key JD Phrases</h4>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {result.keyPhrases.map(k => <span key={k} className="badge badge-purple">{k}</span>)}
                  </div>
                </div>
              )}

              {/* Courses */}
              {result.courses.length > 0 && (
                <div className="glass-card" style={{ padding: '1.25rem' }}>
                  <h4 style={{ marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>📚 Recommended Courses</h4>
                  {result.courses.map((c, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: 8, background: 'rgba(255,255,255,0.03)', marginBottom: '0.5rem', border: '1px solid var(--border)' }}>
                      <div>
                        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.15rem' }}>{c.title}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.platform} · {c.duration}</p>
                      </div>
                      <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>Enroll →</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
