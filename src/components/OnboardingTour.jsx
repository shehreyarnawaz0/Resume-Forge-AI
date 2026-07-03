import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

export default function OnboardingTour() {
  const location = useLocation()

  useEffect(() => {
    // Only run on home page
    if (location.pathname !== '/') return

    // Check if already seen
    const hasSeenTour = localStorage.getItem('rf-tour-seen')
    if (hasSeenTour) return

    const tour = driver({
      showProgress: true,
      animate: true,
      steps: [
        {
          element: '.hero-title',
          popover: {
            title: 'Welcome to ResumeForge AI! ⚡',
            description: 'Your all-in-one platform to build, scan, and optimize your resume for the ATS.',
            side: 'bottom',
            align: 'center'
          }
        },
        {
          element: '.navbar-links a[href="/builder"]',
          popover: {
            title: '1. The Builder',
            description: 'Start here! Build your resume with live previews, 11 templates, and AI action verbs.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '.navbar-links a[href="/scanner"]',
          popover: {
            title: '2. The Scanner',
            description: 'Upload your finished PDF to get an instant ATS score and AI feedback.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '.navbar-links a[href="/matcher"]',
          popover: {
            title: '3. Job Matcher',
            description: 'Paste a Job Description here to find your skill gaps before you apply.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '.navbar-links a[href="/job-tracker"]',
          popover: {
            title: '4. Job Tracker',
            description: 'Finally, track your application progress with our Kanban board.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '.theme-toggle',
          popover: {
            title: 'Dark/Light Mode 🌓',
            description: 'Toggle between stunning dark and light themes at any time.',
            side: 'bottom',
            align: 'end'
          }
        }
      ],
      onDestroyStarted: () => {
        localStorage.setItem('rf-tour-seen', 'true')
        tour.destroy()
      }
    })

    // Slight delay to ensure DOM is ready
    setTimeout(() => {
      tour.drive()
    }, 1000)

  }, [location.pathname])

  return null
}
