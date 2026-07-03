import { createContext, useContext, useState, useEffect } from 'react'

const ResumeContext = createContext()

const emptyResume = {
  personal: { name: '', email: '', phone: '', title: '', location: '', linkedin: '', github: '' },
  summary: '',
  experience: [
    { id: 1, company: '', role: '', startDate: '', endDate: '', current: false, bullets: [''] }
  ],
  education: [
    { id: 1, school: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' }
  ],
  projects: [
    { id: 1, name: '', description: '', tech: '', link: '' }
  ],
  certifications: [
    { id: 1, name: '', issuer: '', date: '', link: '' }
  ],
  skills: [],
  languages: [],
  sectionOrder: ['personal', 'summary', 'experience', 'education', 'projects', 'skills', 'certifications', 'languages'],
  templateId: 1,
}

function loadResume() {
  try {
    const saved = localStorage.getItem('rf-resume')
    if (saved) {
      const parsed = JSON.parse(saved)
      return { ...emptyResume, ...parsed }
    }
  } catch {}
  return { ...emptyResume }
}

function loadSavedResumes() {
  try {
    const saved = localStorage.getItem('rf-saved-resumes')
    if (saved) return JSON.parse(saved)
  } catch {}
  return []
}

function loadScanHistory() {
  try {
    const saved = localStorage.getItem('rf-scan-history')
    if (saved) return JSON.parse(saved)
  } catch {}
  return []
}

export function ResumeProvider({ children }) {
  const [resume, setResume] = useState(loadResume)
  const [savedResumes, setSavedResumes] = useState(loadSavedResumes)
  const [scanHistory, setScanHistory] = useState(loadScanHistory)

  // Auto-save current resume
  useEffect(() => {
    localStorage.setItem('rf-resume', JSON.stringify(resume))
  }, [resume])

  // Save resume list
  useEffect(() => {
    localStorage.setItem('rf-saved-resumes', JSON.stringify(savedResumes))
  }, [savedResumes])

  // Save scan history
  useEffect(() => {
    localStorage.setItem('rf-scan-history', JSON.stringify(scanHistory))
  }, [scanHistory])

  const updatePersonal = (field, value) => {
    setResume(prev => ({ ...prev, personal: { ...prev.personal, [field]: value } }))
  }

  const updateSummary = (value) => {
    setResume(prev => ({ ...prev, summary: value }))
  }

  const addEntry = (section) => {
    setResume(prev => {
      const arr = [...prev[section]]
      const newId = Math.max(0, ...arr.map(e => e.id)) + 1
      const template = section === 'experience'
        ? { id: newId, company: '', role: '', startDate: '', endDate: '', current: false, bullets: [''] }
        : section === 'education'
        ? { id: newId, school: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' }
        : section === 'projects'
        ? { id: newId, name: '', description: '', tech: '', link: '' }
        : { id: newId, name: '', issuer: '', date: '', link: '' }
      return { ...prev, [section]: [...arr, template] }
    })
  }

  const removeEntry = (section, id) => {
    setResume(prev => ({
      ...prev,
      [section]: prev[section].filter(e => e.id !== id)
    }))
  }

  const updateEntry = (section, id, field, value) => {
    setResume(prev => ({
      ...prev,
      [section]: prev[section].map(e => e.id === id ? { ...e, [field]: value } : e)
    }))
  }

  const updateBullet = (expId, bulletIdx, value) => {
    setResume(prev => ({
      ...prev,
      experience: prev.experience.map(e => {
        if (e.id !== expId) return e
        const bullets = [...e.bullets]
        bullets[bulletIdx] = value
        return { ...e, bullets }
      })
    }))
  }

  const addBullet = (expId) => {
    setResume(prev => ({
      ...prev,
      experience: prev.experience.map(e =>
        e.id === expId ? { ...e, bullets: [...e.bullets, ''] } : e
      )
    }))
  }

  const removeBullet = (expId, bulletIdx) => {
    setResume(prev => ({
      ...prev,
      experience: prev.experience.map(e => {
        if (e.id !== expId) return e
        return { ...e, bullets: e.bullets.filter((_, i) => i !== bulletIdx) }
      })
    }))
  }

  const setSkills = (skills) => {
    setResume(prev => ({ ...prev, skills }))
  }

  const addSkill = (skill) => {
    setResume(prev => {
      if (prev.skills.includes(skill)) return prev
      return { ...prev, skills: [...prev.skills, skill] }
    })
  }

  const removeSkill = (skill) => {
    setResume(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }))
  }

  const setLanguages = (languages) => {
    setResume(prev => ({ ...prev, languages }))
  }

  const setSectionOrder = (order) => {
    setResume(prev => ({ ...prev, sectionOrder: order }))
  }

  const setTemplateId = (id) => {
    setResume(prev => ({ ...prev, templateId: id }))
  }

  const saveResume = (name) => {
    const saved = {
      id: Date.now(),
      name: name || `Resume ${savedResumes.length + 1}`,
      data: { ...resume },
      createdAt: new Date().toISOString(),
      lastScanScore: null,
    }
    setSavedResumes(prev => [...prev, saved])
    return saved
  }

  const deleteResume = (id) => {
    setSavedResumes(prev => prev.filter(r => r.id !== id))
  }

  const loadSavedResume = (id) => {
    const found = savedResumes.find(r => r.id === id)
    if (found) setResume({ ...emptyResume, ...found.data })
  }

  const resetResume = () => {
    setResume({ ...emptyResume })
  }

  const addScanResult = (result) => {
    setScanHistory(prev => [result, ...prev].slice(0, 20))
  }

  return (
    <ResumeContext.Provider value={{
      resume, setResume,
      updatePersonal, updateSummary,
      addEntry, removeEntry, updateEntry,
      updateBullet, addBullet, removeBullet,
      setSkills, addSkill, removeSkill,
      setLanguages, setSectionOrder, setTemplateId,
      savedResumes, saveResume, deleteResume, loadSavedResume, resetResume,
      scanHistory, addScanResult,
    }}>
      {children}
    </ResumeContext.Provider>
  )
}

export function useResume() {
  return useContext(ResumeContext)
}
