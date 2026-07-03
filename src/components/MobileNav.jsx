import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

const navLinks = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/builder', label: 'Builder', icon: '📝' },
  { to: '/scanner', label: 'Scanner', icon: '🔍' },
  { to: '/matcher', label: 'Matcher', icon: '🎯' },
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/job-tracker', label: 'Jobs', icon: '💼' },
]

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const { isDark, toggleTheme } = useTheme()

  return (
    <div className="mobile-nav-wrapper">
      <button className="hamburger-btn" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
        <span className={`hamburger-line ${isOpen ? 'open' : ''}`} />
        <span className={`hamburger-line ${isOpen ? 'open' : ''}`} />
        <span className={`hamburger-line ${isOpen ? 'open' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="mobile-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              className="mobile-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
            >
              <div className="mobile-drawer-header">
                <span className="navbar-brand">
                  <span>⚡</span> ResumeForge AI
                </span>
                <button className="mobile-close" onClick={() => setIsOpen(false)}>✕</button>
              </div>
              <nav className="mobile-links">
                {navLinks.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`mobile-link ${location.pathname === link.to ? 'active' : ''}`}
                    onClick={() => setIsOpen(false)}
                  >
                    <span>{link.icon}</span>
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="mobile-theme-toggle">
                <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={toggleTheme}>
                  {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
