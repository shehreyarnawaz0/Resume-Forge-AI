import './App.css'
import './styles/glass.css'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useTheme } from './context/ThemeContext'
import MobileNav from './components/MobileNav'
import PageTransition from './components/PageTransition'
import OnboardingTour from './components/OnboardingTour'
import Home from './pages/Home'
import Builder from './pages/Builder'
import Scanner from './pages/Scanner'
import Matcher from './pages/Matcher'
import Dashboard from './pages/Dashboard'
import JobTracker from './pages/JobTracker'

const navLinks = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/builder', label: 'Builder', icon: '📝' },
  { to: '/scanner', label: 'Scanner', icon: '🔍' },
  { to: '/matcher', label: 'Matcher', icon: '🎯' },
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/job-tracker', label: 'Jobs', icon: '💼' },
]

function App() {
  const location = useLocation()
  const { isDark, toggleTheme } = useTheme()

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          <span>⚡</span> ResumeForge AI
        </Link>
        <div className="navbar-links desktop-only">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
            >
              <span className="nav-icon">{link.icon}</span>
              {link.label}
            </Link>
          ))}
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
        <MobileNav />
      </nav>

      <OnboardingTour />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/builder" element={<PageTransition><Builder /></PageTransition>} />
          <Route path="/scanner" element={<PageTransition><Scanner /></PageTransition>} />
          <Route path="/matcher" element={<PageTransition><Matcher /></PageTransition>} />
          <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
          <Route path="/job-tracker" element={<PageTransition><JobTracker /></PageTransition>} />
        </Routes>
      </AnimatePresence>
    </>
  )
}

export default App
