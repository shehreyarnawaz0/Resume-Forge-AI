import { useState } from 'react'
import { motion } from 'framer-motion'
import { useResume } from '../context/ResumeContext'
import LoadingSkeleton, { SkeletonCard } from '../components/LoadingSkeleton'

const weakVerbs = ['helped', 'worked', 'did', 'made', 'was responsible', 'handled', 'used', 'assisted', 'participated']
const strongVerbs = ['engineered', 'developed', 'architected', 'spearheaded', 'implemented', 'optimized', 'launched', 'designed']
const commonMistakes = [
  { pattern: /\breferences available\b/i, msg: 'Remove "References available upon request" — it\'s outdated.' },
  { pattern: /\bobjective\b/i, msg: 'Replace "Objective" with a "Professional Summary" — more modern and impactful.' },
  { pattern: /\bresponsible for\b/i, msg: 'Replace "responsible for" with action verbs like "Led", "Managed", "Developed".' },
  { pattern: /\bhard worker\b/i, msg: 'Avoid subjective claims like "hard worker". Show measurable results instead.' },
  { pattern: /\bteam player\b/i, msg: '"Team player" is a cliché. Describe specific collaboration achievements instead.' },
  { pattern: /\bsynergy\b/i, msg: 'Avoid buzzwords like "synergy". Use concrete, specific language.' },
]

function analyzeResume(text) {
  const lines = text.split('\n').filter(l => l.trim())
  const words = text.split(/\s+/)
  const issues = []
  let formatScore = 80
  let keywordScore = 60
  let expScore = 70
  let eduScore = 75
  let skillScore = 55

  // Length check
  if (words.length < 100) {
    issues.push({ type: 'warning', msg: 'Resume seems too short. Aim for 400-600 words for a strong resume.' })
    formatScore -= 15
  } else if (words.length > 1000) {
    issues.push({ type: 'warning', msg: 'Resume may be too long. Try to keep it under 2 pages.' })
    formatScore -= 10
  } else {
    issues.push({ type: 'success', msg: `Good resume length: ${words.length} words.` })
  }

  // Section headers
  const hasExperience = /experience|work history|employment/i.test(text)
  const hasEducation = /education|academic/i.test(text)
  const hasSkills = /skills|technical|technologies/i.test(text)
  const hasSummary = /summary|profile|objective/i.test(text)

  if (hasExperience) { expScore += 10; issues.push({ type: 'success', msg: 'Experience section detected.' }) }
  else { issues.push({ type: 'error', msg: 'Missing Experience/Work History section.' }) }

  if (hasEducation) { eduScore += 10; issues.push({ type: 'success', msg: 'Education section detected.' }) }
  else { issues.push({ type: 'warning', msg: 'Missing Education section.' }) }

  if (hasSkills) { skillScore += 15; issues.push({ type: 'success', msg: 'Skills section detected.' }) }
  else { issues.push({ type: 'error', msg: 'Missing Skills section — critical for ATS keyword matching!' }) }

  if (hasSummary) { issues.push({ type: 'success', msg: 'Professional Summary detected.' }) }
  else { issues.push({ type: 'info', msg: 'Consider adding a Professional Summary at the top.' }) }

  // Email & phone check
  const hasEmail = /[\w.-]+@[\w.-]+\.\w+/.test(text)
  const hasPhone = /[\d()+-]{10,}/.test(text)
  if (hasEmail) { issues.push({ type: 'success', msg: 'Email address found in contact info.' }) }
  else { issues.push({ type: 'error', msg: 'No email address found. ATS needs contact info!' }); formatScore -= 10 }
  if (!hasPhone) { issues.push({ type: 'warning', msg: 'No phone number detected.' }) }

  // Weak verbs
  const foundWeak = weakVerbs.filter(v => text.toLowerCase().includes(v))
  if (foundWeak.length > 0) {
    issues.push({ type: 'warning', msg: `Weak action verbs detected: "${foundWeak.join('", "')}". Use stronger verbs.` })
    expScore -= 5 * foundWeak.length
  }

  // Quantifiable achievements
  const hasNumbers = /\d+%|\$\d|\d+ (users|customers|clients|projects|team|people)/i.test(text)
  if (hasNumbers) {
    issues.push({ type: 'success', msg: 'Quantifiable achievements detected — great for ATS!' })
    expScore += 10
  } else {
    issues.push({ type: 'warning', msg: 'Add measurable achievements (e.g., "Increased revenue by 30%").' })
  }

  // Common mistakes
  commonMistakes.forEach(({ pattern, msg }) => {
    if (pattern.test(text)) {
      issues.push({ type: 'warning', msg })
      formatScore -= 5
    }
  })

  // LinkedIn / GitHub
  if (/linkedin|github/i.test(text)) {
    issues.push({ type: 'success', msg: 'LinkedIn/GitHub profile link found.' })
    formatScore += 5
  } else {
    issues.push({ type: 'info', msg: 'Consider adding LinkedIn/GitHub profile links.' })
  }

  // Clamp scores
  const clamp = (v) => Math.max(0, Math.min(100, v))
  const sections = [
    { label: 'Formatting', score: clamp(formatScore), color: formatScore >= 70 ? '#10b981' : formatScore >= 50 ? '#f59e0b' : '#ef4444' },
    { label: 'Keywords', score: clamp(keywordScore), color: keywordScore >= 70 ? '#10b981' : keywordScore >= 50 ? '#f59e0b' : '#ef4444' },
    { label: 'Experience', score: clamp(expScore), color: expScore >= 70 ? '#10b981' : expScore >= 50 ? '#f59e0b' : '#ef4444' },
    { label: 'Education', score: clamp(eduScore), color: eduScore >= 70 ? '#10b981' : eduScore >= 50 ? '#f59e0b' : '#ef4444' },
    { label: 'Skills', score: clamp(skillScore), color: skillScore >= 70 ? '#10b981' : skillScore >= 50 ? '#f59e0b' : '#ef4444' },
  ]

  const overall = Math.round(sections.reduce((a, s) => a + s.score, 0) / sections.length)

  // Bullet analysis
  const bulletLines = lines.filter(l => l.trim().startsWith('•') || l.trim().startsWith('-') || l.trim().startsWith('*'))
  const bulletAnalysis = bulletLines.map(b => {
    const trimmed = b.replace(/^[•\-*]\s*/, '').trim()
    const firstWord = trimmed.split(/\s/)[0]?.toLowerCase() || ''
    const isStrong = strongVerbs.some(v => firstWord.startsWith(v.slice(0, 4)))
    const isWeak = weakVerbs.some(v => firstWord.startsWith(v.slice(0, 4)))
    return {
      text: trimmed.slice(0, 80) + (trimmed.length > 80 ? '...' : ''),
      strength: isStrong ? 'strong' : isWeak ? 'weak' : 'neutral',
    }
  }).slice(0, 8)

  return { score: overall, sections, issues, bulletAnalysis }
}

const iconMap = { warning: '⚠️', error: '❌', info: 'ℹ️', success: '✅' }
const colorMap = {
  warning: 'rgba(245,158,11,0.1)',
  error: 'rgba(239,68,68,0.1)',
  info: 'rgba(99,102,241,0.1)',
  success: 'rgba(16,185,129,0.1)',
}

export default function Scanner() {
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [scanned, setScanned] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [extractedText, setExtractedText] = useState('')
  const { addScanResult } = useResume()

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) setFile(dropped)
  }

  const extractTextFromFile = async (file) => {
    // For text-based files, just read as text
    if (file.name.endsWith('.txt')) {
      return await file.text()
    }

    // For PDF, try to extract text
    if (file.name.endsWith('.pdf')) {
      try {
        const arrayBuffer = await file.arrayBuffer()
        const pdfjsLib = await import('pdfjs-dist')
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        let fullText = ''
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const content = await page.getTextContent()
          fullText += content.items.map(item => item.str).join(' ') + '\n'
        }
        return fullText
      } catch (err) {
        console.error('PDF parse error:', err)
        return 'Error parsing PDF. Please try a different file.'
      }
    }

    // For DOCX - read as text (simplified)
    return await file.text()
  }

  const handleScan = async () => {
    if (!file) return
    setLoading(true)
    setScanned(false)

    try {
      const text = await extractTextFromFile(file)
      setExtractedText(text)

      // Simulate a slight delay for UX
      await new Promise(r => setTimeout(r, 1500))

      const analysis = analyzeResume(text)
      setResult(analysis)
      setScanned(true)

      addScanResult({
        id: Date.now(),
        fileName: file.name,
        score: analysis.score,
        date: new Date().toISOString(),
      })
    } catch (err) {
      console.error('Scan error:', err)
    } finally {
      setLoading(false)
    }
  }

  const scoreLabel = (s) => s >= 80 ? 'Excellent' : s >= 65 ? 'Good' : s >= 50 ? 'Needs Work' : 'Poor'
  const scoreColor = (s) => s >= 80 ? '#10b981' : s >= 65 ? '#06b6d4' : s >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '2rem' }}>
        <div className="badge badge-cyan" style={{ marginBottom: '0.75rem' }}>🔍 AI ATS Scanner</div>
        <h1 className="section-title">Scan Your Resume</h1>
        <p className="section-sub">Upload a PDF or text file and get instant ATS score with actionable AI feedback.</p>
      </div>

      <div className="scanner-layout">
        {/* Upload Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div
            className={`drop-zone glass-card ${dragging ? 'drop-zone-active' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <div className="drop-icon">📄</div>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              {file ? file.name : 'Drop your resume here'}
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Supports PDF, TXT, DOCX'}
            </p>
            <label className="btn-secondary" style={{ cursor: 'pointer' }}>
              📂 Browse File
              <input type="file" accept=".pdf,.docx,.doc,.txt" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
            </label>
          </div>

          <button
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={handleScan}
            disabled={!file || loading}
          >
            {loading ? '⏳ Scanning...' : '🚀 Scan Resume'}
          </button>

          {/* Tips */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h4 style={{ marginBottom: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>💡 ATS Tips</h4>
            {[
              'Use standard section headings (Experience, Education, Skills)',
              'Avoid tables, columns, or text boxes',
              'Start bullets with strong action verbs',
              'Include measurable achievements with numbers',
              'Keep formatting simple and consistent',
            ].map((tip, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <span style={{ color: '#10b981', flexShrink: 0 }}>✓</span> {tip}
              </div>
            ))}
          </div>
        </div>

        {/* Results Panel */}
        <div>
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <SkeletonCard height={130} />
              <SkeletonCard height={200} />
              <SkeletonCard height={180} />
            </div>
          )}

          {!scanned && !loading && (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🤖</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Upload a resume and click <strong style={{ color: 'var(--text-secondary)' }}>Scan Resume</strong> to see AI feedback here.</p>
            </div>
          )}

          {scanned && result && (
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
                      cx="50" cy="50" r="42" fill="none" stroke="url(#scoreGrad)" strokeWidth="10"
                      strokeDasharray={`${2 * Math.PI * 42}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - result.score / 100) }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6366f1" />
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
                      {result.score}
                    </motion.span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>/100</span>
                  </div>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>ATS Score: <span style={{ color: scoreColor(result.score) }}>{scoreLabel(result.score)}</span></h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Based on formatting, keywords, experience, education, and skills analysis.</p>
                </div>
              </div>

              {/* Section Breakdown */}
              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <h4 style={{ marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Section Breakdown</h4>
                {result.sections.map((s, i) => (
                  <div key={i} style={{ marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                      <span style={{ color: s.color, fontWeight: 700 }}>{s.score}%</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.05)' }}>
                      <motion.div
                        style={{ height: '100%', borderRadius: 999, background: s.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${s.score}%` }}
                        transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Bullet Strength */}
              {result.bulletAnalysis.length > 0 && (
                <div className="glass-card" style={{ padding: '1.25rem' }}>
                  <h4 style={{ marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>💪 Bullet Point Strength</h4>
                  {result.bulletAnalysis.map((b, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                      <span style={{ flexShrink: 0 }}>
                        {b.strength === 'strong' ? '🟢' : b.strength === 'weak' ? '🔴' : '🟡'}
                      </span>
                      <span style={{ color: 'var(--text-secondary)' }}>{b.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Issues */}
              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <h4 style={{ marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Feedback</h4>
                {result.issues.map((issue, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', borderRadius: 8, background: colorMap[issue.type], marginBottom: '0.5rem', fontSize: '0.875rem', alignItems: 'flex-start' }}
                  >
                    <span>{iconMap[issue.type]}</span>
                    <span style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{issue.msg}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
