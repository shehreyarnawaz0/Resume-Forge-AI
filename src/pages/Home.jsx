import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useResume } from '../context/ResumeContext'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
}

export default function Home() {
  const { savedResumes } = useResume()

  return (
    <div className="page-wrapper" style={{ padding: '0 1rem' }}>
      <motion.section
        className="hero-section"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="badge badge-purple" style={{ marginBottom: '1.5rem' }}>
          ✨ Version 2.0 is live!
        </motion.div>
        
        <motion.h1 variants={itemVariants} className="hero-title">
          Land Your Dream Job with<br />
          <span className="gradient-text">AI-Powered Resumes</span>
        </motion.h1>
        
        <motion.p variants={itemVariants} className="hero-sub">
          Build ATS-friendly resumes in minutes. Scan your current resume for fatal flaws. 
          Match your skills to real job descriptions using advanced AI heuristics.
        </motion.p>
        
        <motion.div variants={itemVariants} className="hero-actions">
          <Link to="/builder" className="btn-primary">
            🚀 Start Building
          </Link>
          <Link to="/scanner" className="btn-secondary">
            🔍 Scan Existing Resume
          </Link>
        </motion.div>

        <motion.div variants={itemVariants} className="stats-grid">
          <div className="stat-card glass-card">
            <div className="stat-number gradient-text">95%</div>
            <div className="stat-label">ATS Pass Rate</div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-number gradient-text">11+</div>
            <div className="stat-label">Pro Templates</div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-number gradient-text">Smart</div>
            <div className="stat-label">JD Matching</div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-number gradient-text">{savedResumes.length > 0 ? savedResumes.length : '100s'}</div>
            <div className="stat-label">{savedResumes.length > 0 ? 'Your Resumes' : 'Resumes Built'}</div>
          </div>
        </motion.div>
      </motion.section>

      <section style={{ padding: '4rem 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>Everything you need to get hired</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Powerful tools designed to beat the ATS and impress recruiters.</p>
        </div>

        <motion.div
          className="features-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.div variants={itemVariants} className="feature-card glass-card">
            <div className="feature-icon">📝</div>
            <h3 className="feature-title">Smart Builder</h3>
            <p className="feature-desc">Interactive resume builder with live preview, drag & drop sections, and instant AI action-verb suggestions.</p>
            <Link to="/builder" className="feature-cta">Try Builder →</Link>
          </motion.div>

          <motion.div variants={itemVariants} className="feature-card glass-card">
            <div className="feature-icon">🔍</div>
            <h3 className="feature-title">ATS Scanner</h3>
            <p className="feature-desc">Upload your PDF and get instant feedback on formatting, keywords, bullet strength, and grammar.</p>
            <Link to="/scanner" className="feature-cta">Try Scanner →</Link>
          </motion.div>

          <motion.div variants={itemVariants} className="feature-card glass-card">
            <div className="feature-icon">🎯</div>
            <h3 className="feature-title">Job Matcher</h3>
            <p className="feature-desc">Paste a job description to extract keywords, find your skill gaps, and get course recommendations to level up.</p>
            <Link to="/matcher" className="feature-cta">Try Matcher →</Link>
          </motion.div>

          <motion.div variants={itemVariants} className="feature-card glass-card">
            <div className="feature-icon">💼</div>
            <h3 className="feature-title">Job Tracker</h3>
            <p className="feature-desc">A Kanban board to track your job applications from applied, to interview, to offer.</p>
            <Link to="/job-tracker" className="feature-cta">Try Tracker →</Link>
          </motion.div>

          <motion.div variants={itemVariants} className="feature-card glass-card">
            <div className="feature-icon">📊</div>
            <h3 className="feature-title">Analytics Dashboard</h3>
            <p className="feature-desc">Track your ATS scores over time and manage your portfolio of targeted resumes.</p>
            <Link to="/dashboard" className="feature-cta">View Dashboard →</Link>
          </motion.div>

          <motion.div variants={itemVariants} className="feature-card glass-card">
            <div className="feature-icon">🌗</div>
            <h3 className="feature-title">Dark & Light Mode</h3>
            <p className="feature-desc">A stunning glass-morphism UI that looks gorgeous whether you prefer light or dark themes.</p>
            <span className="feature-cta" style={{ color: 'var(--text-muted)' }}>Toggle above ↗</span>
          </motion.div>
        </motion.div>
      </section>
    </div>
  )
}
