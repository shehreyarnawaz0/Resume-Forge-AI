import { useState, useRef } from 'react'
import { useResume } from '../context/ResumeContext'
import { motion, AnimatePresence } from 'framer-motion'

const templates = [
  { id: 1, name: 'Modern Pro', layout: 'modern', accent: '#6366f1', tags: ['Modern', 'ATS'] },
  { id: 2, name: 'Classic Elegant', layout: 'classic', accent: '#111827', tags: ['Formal', 'Biz'] },
  { id: 3, name: 'Tech Split', layout: 'two-column', accent: '#06b6d4', tags: ['Clean', 'Dev'] },
  { id: 4, name: 'Harvard ATS', layout: 'harvard', accent: '#000000', tags: ['Strict', 'ATS'] },
  { id: 5, name: 'Clean Minimalist', layout: 'minimalist', accent: '#475569', tags: ['Clean', 'Simple'] },
  { id: 6, name: 'Creative Bold', layout: 'modern', accent: '#ec4899', tags: ['Design', 'Bold'] },
  { id: 7, name: 'Dark Elite', layout: 'classic', accent: '#8b5cf6', tags: ['Dark', 'Sleek'] },
  { id: 8, name: 'Fresh Start', layout: 'two-column', accent: '#10b981', tags: ['New Grad'] },
  { id: 9, name: 'Google Standard', layout: 'harvard', accent: '#333333', tags: ['Tech', 'Standard'] },
]

const tabs = [
  { key: 'personal', label: '👤 Personal', icon: '👤' },
  { key: 'summary', label: '📋 Summary', icon: '📋' },
  { key: 'experience', label: '💼 Experience', icon: '💼' },
  { key: 'education', label: '🎓 Education', icon: '🎓' },
  { key: 'projects', label: '🚀 Projects', icon: '🚀' },
  { key: 'skills', label: '⚡ Skills', icon: '⚡' },
  { key: 'certifications', label: '🏆 Certs', icon: '🏆' },
  { key: 'template', label: '🎨 Template', icon: '🎨' },
]

const weakVerbs = {
  'helped': 'Facilitated',
  'worked on': 'Engineered',
  'responsible for': 'Spearheaded',
  'made': 'Developed',
  'did': 'Executed',
  'was part of': 'Contributed to',
  'handled': 'Managed',
  'used': 'Leveraged',
}

function getVerbSuggestion(text) {
  const lower = text.toLowerCase()
  for (const [weak, strong] of Object.entries(weakVerbs)) {
    if (lower.startsWith(weak)) {
      return { weak, strong }
    }
  }
  return null
}

export default function Builder() {
  const {
    resume, updatePersonal, updateSummary,
    addEntry, removeEntry, updateEntry,
    updateBullet, addBullet, removeBullet,
    setSkills, addSkill, removeSkill,
    setTemplateId, saveResume,
  } = useResume()

  const [activeTab, setActiveTab] = useState('personal')
  const [skillInput, setSkillInput] = useState('')
  const [saveMsg, setSaveMsg] = useState('')
  const previewRef = useRef(null)

  const currentTabIndex = tabs.findIndex(t => t.key === activeTab)
  const handlePrevTab = () => {
    if (currentTabIndex > 0) setActiveTab(tabs[currentTabIndex - 1].key)
  }
  const handleNextTab = () => {
    if (currentTabIndex < tabs.length - 1) setActiveTab(tabs[currentTabIndex + 1].key)
  }

  const selectedTemplate = templates.find(t => t.id === resume.templateId) || templates[0]

  const handleExportPDF = async () => {
    const el = previewRef.current
    if (!el) return
    try {
      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = await import('jspdf')
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#fff', useCORS: true })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfW = pdf.internal.pageSize.getWidth()
      const pdfH = (canvas.height * pdfW) / canvas.width
      pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH)
      pdf.save(`${resume.personal.name || 'resume'}.pdf`)
    } catch (err) {
      console.error('PDF export error:', err)
    }
  }

  const handleSave = () => {
    const name = resume.personal.name ? `${resume.personal.name}'s Resume` : 'My Resume'
    saveResume(name)
    setSaveMsg('✅ Resume saved!')
    setTimeout(() => setSaveMsg(''), 2000)
  }

  const handleSkillAdd = (e) => {
    e.preventDefault()
    if (skillInput.trim()) {
      addSkill(skillInput.trim())
      setSkillInput('')
    }
  }

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="badge badge-purple" style={{ marginBottom: '0.75rem' }}>📝 Resume Builder</div>
        <h1 className="section-title">Build Your Resume</h1>
        <p className="section-sub">Fill in details, pick a template, and export a stunning ATS-ready PDF.</p>
      </div>

      <div className="builder-layout">
        {/* LEFT: Form Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Tabs */}
          <div className="builder-tabs glass-card" style={{ padding: '0.5rem' }}>
            <div className="tabs-scroll">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  className={`tab-btn ${activeTab === tab.key ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
              >
                {activeTab === 'personal' && (
                  <div>
                    <h3 className="form-section-title">Personal Information</h3>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input className="glass-input" value={resume.personal.name} onChange={e => updatePersonal('name', e.target.value)} placeholder="e.g. John Doe" />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Email</label>
                        <input className="glass-input" value={resume.personal.email} onChange={e => updatePersonal('email', e.target.value)} placeholder="john@email.com" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Phone</label>
                        <input className="glass-input" value={resume.personal.phone} onChange={e => updatePersonal('phone', e.target.value)} placeholder="+1 555-0000" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Job Title</label>
                      <input className="glass-input" value={resume.personal.title} onChange={e => updatePersonal('title', e.target.value)} placeholder="Senior Software Engineer" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Location</label>
                      <input className="glass-input" value={resume.personal.location} onChange={e => updatePersonal('location', e.target.value)} placeholder="San Francisco, CA" />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">LinkedIn</label>
                        <input className="glass-input" value={resume.personal.linkedin} onChange={e => updatePersonal('linkedin', e.target.value)} placeholder="linkedin.com/in/johndoe" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">GitHub</label>
                        <input className="glass-input" value={resume.personal.github} onChange={e => updatePersonal('github', e.target.value)} placeholder="github.com/johndoe" />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'summary' && (
                  <div>
                    <h3 className="form-section-title">Professional Summary</h3>
                    <textarea
                      className="glass-input"
                      value={resume.summary}
                      onChange={e => updateSummary(e.target.value)}
                      rows={6}
                      placeholder="A brief, impactful summary of your professional experience, key skills, and career goals. Keep it 3-4 sentences."
                    />
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                      💡 Tip: Start with years of experience, mention top skills, and state your career goal.
                    </p>
                  </div>
                )}

                {activeTab === 'experience' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h3 className="form-section-title" style={{ marginBottom: 0 }}>Work Experience</h3>
                      <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => addEntry('experience')}>
                        + Add Job
                      </button>
                    </div>
                    {resume.experience.map((exp, idx) => (
                      <div key={exp.id} className="entry-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                          <span className="badge badge-purple">Job {idx + 1}</span>
                          {resume.experience.length > 1 && (
                            <button className="remove-btn" onClick={() => removeEntry('experience', exp.id)}>🗑</button>
                          )}
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label className="form-label">Company</label>
                            <input className="glass-input" value={exp.company} onChange={e => updateEntry('experience', exp.id, 'company', e.target.value)} placeholder="Google" />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Role</label>
                            <input className="glass-input" value={exp.role} onChange={e => updateEntry('experience', exp.id, 'role', e.target.value)} placeholder="Software Engineer" />
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label className="form-label">Start Date</label>
                            <input type="month" className="glass-input" value={exp.startDate} onChange={e => updateEntry('experience', exp.id, 'startDate', e.target.value)} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">End Date</label>
                            <input type="month" className="glass-input" value={exp.endDate} onChange={e => updateEntry('experience', exp.id, 'endDate', e.target.value)} disabled={exp.current} />
                          </div>
                        </div>
                        <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', cursor: 'pointer' }}>
                          <input type="checkbox" checked={exp.current} onChange={e => updateEntry('experience', exp.id, 'current', e.target.checked)} /> Currently working here
                        </label>
                        <div className="form-group">
                          <label className="form-label">Bullet Points</label>
                          {exp.bullets.map((bullet, bi) => {
                            const suggestion = getVerbSuggestion(bullet)
                            return (
                              <div key={bi} style={{ marginBottom: '0.5rem' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                  <input className="glass-input" value={bullet} onChange={e => updateBullet(exp.id, bi, e.target.value)} placeholder="Describe an achievement..." style={{ flex: 1 }} />
                                  {exp.bullets.length > 1 && (
                                    <button className="remove-btn" onClick={() => removeBullet(exp.id, bi)}>✕</button>
                                  )}
                                </div>
                                {suggestion && (
                                  <div className="verb-suggestion">
                                    💡 Replace "<em>{suggestion.weak}</em>" with "<strong>{suggestion.strong}</strong>"
                                  </div>
                                )}
                              </div>
                            )
                          })}
                          <button className="btn-secondary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem' }} onClick={() => addBullet(exp.id)}>+ Add Bullet</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'education' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h3 className="form-section-title" style={{ marginBottom: 0 }}>Education</h3>
                      <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => addEntry('education')}>+ Add</button>
                    </div>
                    {resume.education.map((edu, idx) => (
                      <div key={edu.id} className="entry-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                          <span className="badge badge-cyan">Education {idx + 1}</span>
                          {resume.education.length > 1 && (
                            <button className="remove-btn" onClick={() => removeEntry('education', edu.id)}>🗑</button>
                          )}
                        </div>
                        <div className="form-group">
                          <label className="form-label">School / University</label>
                          <input className="glass-input" value={edu.school} onChange={e => updateEntry('education', edu.id, 'school', e.target.value)} placeholder="MIT" />
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label className="form-label">Degree</label>
                            <input className="glass-input" value={edu.degree} onChange={e => updateEntry('education', edu.id, 'degree', e.target.value)} placeholder="B.S." />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Field of Study</label>
                            <input className="glass-input" value={edu.field} onChange={e => updateEntry('education', edu.id, 'field', e.target.value)} placeholder="Computer Science" />
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label className="form-label">Start</label>
                            <input type="month" className="glass-input" value={edu.startDate} onChange={e => updateEntry('education', edu.id, 'startDate', e.target.value)} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">End</label>
                            <input type="month" className="glass-input" value={edu.endDate} onChange={e => updateEntry('education', edu.id, 'endDate', e.target.value)} />
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="form-label">GPA (optional)</label>
                          <input className="glass-input" value={edu.gpa} onChange={e => updateEntry('education', edu.id, 'gpa', e.target.value)} placeholder="3.8 / 4.0" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'projects' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h3 className="form-section-title" style={{ marginBottom: 0 }}>Projects</h3>
                      <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => addEntry('projects')}>+ Add</button>
                    </div>
                    {resume.projects.map((proj, idx) => (
                      <div key={proj.id} className="entry-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                          <span className="badge badge-green">Project {idx + 1}</span>
                          {resume.projects.length > 1 && (
                            <button className="remove-btn" onClick={() => removeEntry('projects', proj.id)}>🗑</button>
                          )}
                        </div>
                        <div className="form-group">
                          <label className="form-label">Project Name</label>
                          <input className="glass-input" value={proj.name} onChange={e => updateEntry('projects', proj.id, 'name', e.target.value)} placeholder="E-Commerce Platform" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Description</label>
                          <textarea className="glass-input" value={proj.description} onChange={e => updateEntry('projects', proj.id, 'description', e.target.value)} rows={3} placeholder="What you built and the impact..." />
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label className="form-label">Tech Stack</label>
                            <input className="glass-input" value={proj.tech} onChange={e => updateEntry('projects', proj.id, 'tech', e.target.value)} placeholder="React, Node.js, MongoDB" />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Link</label>
                            <input className="glass-input" value={proj.link} onChange={e => updateEntry('projects', proj.id, 'link', e.target.value)} placeholder="github.com/..." />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'skills' && (
                  <div>
                    <h3 className="form-section-title">Skills</h3>
                    <form onSubmit={handleSkillAdd} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                      <input className="glass-input" value={skillInput} onChange={e => setSkillInput(e.target.value)} placeholder="Type a skill and press Enter..." style={{ flex: 1 }} />
                      <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Add</button>
                    </form>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {resume.skills.map(skill => (
                        <span key={skill} className="skill-tag">
                          {skill}
                          <button onClick={() => removeSkill(skill)} className="skill-remove">✕</button>
                        </span>
                      ))}
                      {resume.skills.length === 0 && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No skills added yet. Type above to add.</p>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'certifications' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h3 className="form-section-title" style={{ marginBottom: 0 }}>Certifications</h3>
                      <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => addEntry('certifications')}>+ Add</button>
                    </div>
                    {resume.certifications.map((cert, idx) => (
                      <div key={cert.id} className="entry-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                          <span className="badge badge-purple">Cert {idx + 1}</span>
                          {resume.certifications.length > 1 && (
                            <button className="remove-btn" onClick={() => removeEntry('certifications', cert.id)}>🗑</button>
                          )}
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label className="form-label">Certification Name</label>
                            <input className="glass-input" value={cert.name} onChange={e => updateEntry('certifications', cert.id, 'name', e.target.value)} placeholder="AWS Solutions Architect" />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Issuer</label>
                            <input className="glass-input" value={cert.issuer} onChange={e => updateEntry('certifications', cert.id, 'issuer', e.target.value)} placeholder="Amazon" />
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label className="form-label">Date</label>
                            <input type="month" className="glass-input" value={cert.date} onChange={e => updateEntry('certifications', cert.id, 'date', e.target.value)} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Link</label>
                            <input className="glass-input" value={cert.link} onChange={e => updateEntry('certifications', cert.id, 'link', e.target.value)} placeholder="credential URL" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {activeTab === 'template' && (
                  <div>
                    <h3 className="form-section-title">Select Template</h3>
                    <div className="template-grid-large">
                      {templates.map(t => (
                        <div
                          key={t.id}
                          className={`template-card ${resume.templateId === t.id ? 'template-selected' : ''}`}
                          onClick={() => setTemplateId(t.id)}
                          style={{ borderColor: resume.templateId === t.id ? t.accent : undefined }}
                        >
                          <div className="template-thumb" style={{ borderTop: `3px solid ${t.accent}` }}>
                            <div className="template-lines">
                              <div className="tl tl-header" style={{ background: t.accent }} />
                              <div className="tl tl-sub" />
                              <div className="tl tl-body" />
                              <div className="tl tl-body" />
                            </div>
                          </div>
                          <div className="template-name">{t.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Next / Prev Tab Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
            <button 
              className="btn-secondary" 
              style={{ flex: 1, visibility: currentTabIndex === 0 ? 'hidden' : 'visible' }} 
              onClick={handlePrevTab}
            >
              ⬅️ Previous Step
            </button>
            <button 
              className="btn-primary" 
              style={{ flex: 1, visibility: currentTabIndex === tabs.length - 1 ? 'hidden' : 'visible' }} 
              onClick={handleNextTab}
            >
              Next Step ➡️
            </button>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleExportPDF}>⬇️ Export PDF</button>
            <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleSave}>{saveMsg || '💾 Save Resume'}</button>
          </div>
        </div>

        {/* RIGHT: Live Preview (Sticky) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '90px', height: 'calc(100vh - 120px)' }}>
          <div className="glass-card" style={{ padding: '0', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            <div className="preview-toolbar">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📄 Live Preview</span>
              <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>{selectedTemplate.name}</span>
            </div>
            <div className="preview-container-scroll">
              <div ref={previewRef} className="resume-preview-content" style={{ '--template-accent': selectedTemplate.accent }}>
              {/* LAYOUT RENDERER */}
              {selectedTemplate.layout === 'modern' && (
                <div className="layout-modern">
                  <div className="rp-header" style={{ borderBottom: `2px solid ${selectedTemplate.accent}` }}>
                    <h2 className="rp-name">{resume.personal.name || 'Your Name'}</h2>
                    <p className="rp-title">{resume.personal.title || 'Job Title'}</p>
                    <div className="rp-contact">
                      {resume.personal.email && <span>✉ {resume.personal.email}</span>}
                      {resume.personal.phone && <span>📞 {resume.personal.phone}</span>}
                      {resume.personal.location && <span>📍 {resume.personal.location}</span>}
                      {resume.personal.linkedin && <span>🔗 {resume.personal.linkedin}</span>}
                      {resume.personal.github && <span>💻 {resume.personal.github}</span>}
                    </div>
                  </div>
                  {resume.summary && (
                    <div className="rp-section">
                      <h3 className="rp-section-title" style={{ color: selectedTemplate.accent }}>SUMMARY</h3>
                      <p className="rp-text">{resume.summary}</p>
                    </div>
                  )}
                  {resume.experience.some(e => e.company || e.role) && (
                    <div className="rp-section">
                      <h3 className="rp-section-title" style={{ color: selectedTemplate.accent }}>EXPERIENCE</h3>
                      {resume.experience.filter(e => e.company || e.role).map(exp => (
                        <div key={exp.id} className="rp-entry">
                          <div className="rp-entry-header">
                            <strong>{exp.role || 'Role'}</strong>
                            <span className="rp-date">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                          </div>
                          <p className="rp-company">{exp.company}</p>
                          <ul className="rp-bullets">
                            {exp.bullets.filter(b => b).map((b, i) => <li key={i}>{b}</li>)}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                  {resume.education.some(e => e.school || e.degree) && (
                    <div className="rp-section">
                      <h3 className="rp-section-title" style={{ color: selectedTemplate.accent }}>EDUCATION</h3>
                      {resume.education.filter(e => e.school || e.degree).map(edu => (
                        <div key={edu.id} className="rp-entry">
                          <div className="rp-entry-header">
                            <strong>{edu.degree} {edu.field && `in ${edu.field}`}</strong>
                            <span className="rp-date">{edu.startDate} – {edu.endDate}</span>
                          </div>
                          <p className="rp-company">{edu.school}{edu.gpa && ` • GPA: ${edu.gpa}`}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {resume.projects.some(p => p.name) && (
                    <div className="rp-section">
                      <h3 className="rp-section-title" style={{ color: selectedTemplate.accent }}>PROJECTS</h3>
                      {resume.projects.filter(p => p.name).map(proj => (
                        <div key={proj.id} className="rp-entry">
                          <div className="rp-entry-header">
                            <strong>{proj.name}</strong>
                            {proj.link && <span className="rp-date">{proj.link}</span>}
                          </div>
                          {proj.description && <p className="rp-text" style={{ marginTop: '0.2rem' }}>{proj.description}</p>}
                          {proj.tech && <p className="rp-tech">Tech: {proj.tech}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                  {resume.skills.length > 0 && (
                    <div className="rp-section">
                      <h3 className="rp-section-title" style={{ color: selectedTemplate.accent }}>SKILLS</h3>
                      <div className="rp-skills">
                        {resume.skills.map(s => <span key={s} className="rp-skill-tag" style={{ borderColor: selectedTemplate.accent }}>{s}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedTemplate.layout === 'classic' && (
                <div className="layout-classic">
                  <div className="rp-header classic-header">
                    <h2 className="rp-name" style={{ color: '#000' }}>{resume.personal.name || 'Your Name'}</h2>
                    <p className="rp-title">{resume.personal.title || 'Job Title'}</p>
                    <div className="rp-contact">
                      {resume.personal.email && <span>{resume.personal.email}</span>}
                      {resume.personal.phone && <span>| {resume.personal.phone}</span>}
                      {resume.personal.location && <span>| {resume.personal.location}</span>}
                      {resume.personal.linkedin && <span>| {resume.personal.linkedin}</span>}
                    </div>
                  </div>
                  {resume.summary && (
                    <div className="rp-section">
                      <h3 className="rp-section-title classic-title">PROFESSIONAL SUMMARY</h3>
                      <p className="rp-text">{resume.summary}</p>
                    </div>
                  )}
                  {resume.experience.some(e => e.company || e.role) && (
                    <div className="rp-section">
                      <h3 className="rp-section-title classic-title">EXPERIENCE</h3>
                      {resume.experience.filter(e => e.company || e.role).map(exp => (
                        <div key={exp.id} className="rp-entry">
                          <div className="rp-entry-header">
                            <div>
                              <strong style={{ fontSize: '0.9rem' }}>{exp.company}</strong> — <em>{exp.role || 'Role'}</em>
                            </div>
                            <span className="rp-date">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                          </div>
                          <ul className="rp-bullets">
                            {exp.bullets.filter(b => b).map((b, i) => <li key={i}>{b}</li>)}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                  {resume.education.some(e => e.school || e.degree) && (
                    <div className="rp-section">
                      <h3 className="rp-section-title classic-title">EDUCATION</h3>
                      {resume.education.filter(e => e.school || e.degree).map(edu => (
                        <div key={edu.id} className="rp-entry">
                          <div className="rp-entry-header">
                            <strong>{edu.school}</strong>
                            <span className="rp-date">{edu.startDate} – {edu.endDate}</span>
                          </div>
                          <div><em>{edu.degree} {edu.field && `in ${edu.field}`}</em>{edu.gpa && ` • GPA: ${edu.gpa}`}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {resume.skills.length > 0 && (
                    <div className="rp-section">
                      <h3 className="rp-section-title classic-title">SKILLS</h3>
                      <p className="rp-text">{resume.skills.join(' • ')}</p>
                    </div>
                  )}
                </div>
              )}

              {selectedTemplate.layout === 'two-column' && (
                <div className="layout-two-column">
                  <div className="tc-header" style={{ background: selectedTemplate.accent, color: '#fff' }}>
                    <h2 className="rp-name" style={{ color: '#fff', marginBottom: 0 }}>{resume.personal.name || 'Your Name'}</h2>
                    <p className="rp-title" style={{ color: 'rgba(255,255,255,0.8)' }}>{resume.personal.title || 'Job Title'}</p>
                  </div>
                  <div className="tc-body">
                    <div className="tc-sidebar">
                      <div className="rp-section">
                        <h3 className="tc-title" style={{ color: selectedTemplate.accent }}>CONTACT</h3>
                        <div className="tc-contact">
                          {resume.personal.email && <div>{resume.personal.email}</div>}
                          {resume.personal.phone && <div>{resume.personal.phone}</div>}
                          {resume.personal.location && <div>{resume.personal.location}</div>}
                          {resume.personal.linkedin && <div>{resume.personal.linkedin}</div>}
                        </div>
                      </div>
                      {resume.skills.length > 0 && (
                        <div className="rp-section">
                          <h3 className="tc-title" style={{ color: selectedTemplate.accent }}>SKILLS</h3>
                          <div className="rp-skills" style={{ flexDirection: 'column', gap: '0.2rem' }}>
                            {resume.skills.map(s => <span key={s} className="rp-text" style={{ fontWeight: 500 }}>{s}</span>)}
                          </div>
                        </div>
                      )}
                      {resume.education.some(e => e.school || e.degree) && (
                        <div className="rp-section">
                          <h3 className="tc-title" style={{ color: selectedTemplate.accent }}>EDUCATION</h3>
                          {resume.education.filter(e => e.school || e.degree).map(edu => (
                            <div key={edu.id} className="rp-entry" style={{ marginBottom: '0.8rem' }}>
                              <strong style={{ display: 'block', fontSize: '0.85rem' }}>{edu.degree}</strong>
                              <div style={{ fontSize: '0.8rem', color: '#555' }}>{edu.school}</div>
                              <div className="rp-date" style={{ marginTop: '0.2rem' }}>{edu.startDate} – {edu.endDate}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="tc-main">
                      {resume.summary && (
                        <div className="rp-section">
                          <h3 className="tc-title" style={{ color: selectedTemplate.accent }}>PROFILE</h3>
                          <p className="rp-text">{resume.summary}</p>
                        </div>
                      )}
                      {resume.experience.some(e => e.company || e.role) && (
                        <div className="rp-section">
                          <h3 className="tc-title" style={{ color: selectedTemplate.accent }}>EXPERIENCE</h3>
                          {resume.experience.filter(e => e.company || e.role).map(exp => (
                            <div key={exp.id} className="rp-entry">
                              <div className="rp-entry-header" style={{ marginBottom: '0.1rem' }}>
                                <strong style={{ fontSize: '0.9rem' }}>{exp.role || 'Role'}</strong>
                                <span className="rp-date">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                              </div>
                              <p className="rp-company" style={{ color: selectedTemplate.accent, marginBottom: '0.4rem' }}>{exp.company}</p>
                              <ul className="rp-bullets" style={{ paddingLeft: '1rem' }}>
                                {exp.bullets.filter(b => b).map((b, i) => <li key={i}>{b}</li>)}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {selectedTemplate.layout === 'harvard' && (
                <div className="layout-harvard">
                  <div className="hv-header">
                    <h1 className="hv-name">{resume.personal.name || 'Your Name'}</h1>
                    <div className="hv-contact">
                      {[resume.personal.email, resume.personal.phone, resume.personal.location, resume.personal.linkedin].filter(Boolean).join(' | ')}
                    </div>
                  </div>

                  {resume.education.some(e => e.school || e.degree) && (
                    <div className="hv-section">
                      <h3 className="hv-section-title">EDUCATION</h3>
                      {resume.education.filter(e => e.school || e.degree).map(edu => (
                        <div key={edu.id} className="hv-entry">
                          <div className="hv-row">
                            <strong className="hv-left">{edu.school}</strong>
                            <span className="hv-right">{edu.location || ''}</span>
                          </div>
                          <div className="hv-row">
                            <span className="hv-left" style={{ fontStyle: 'italic' }}>{edu.degree} {edu.field && `in ${edu.field}`} {edu.gpa && ` (GPA: ${edu.gpa})`}</span>
                            <span className="hv-right">{edu.startDate} - {edu.endDate}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {resume.experience.some(e => e.company || e.role) && (
                    <div className="hv-section">
                      <h3 className="hv-section-title">EXPERIENCE</h3>
                      {resume.experience.filter(e => e.company || e.role).map(exp => (
                        <div key={exp.id} className="hv-entry">
                          <div className="hv-row">
                            <strong className="hv-left">{exp.company}</strong>
                            <span className="hv-right">{exp.location || ''}</span>
                          </div>
                          <div className="hv-row">
                            <span className="hv-left" style={{ fontStyle: 'italic' }}>{exp.role}</span>
                            <span className="hv-right">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                          </div>
                          <ul className="hv-bullets">
                            {exp.bullets.filter(b => b).map((b, i) => <li key={i}>{b}</li>)}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {resume.projects.some(p => p.name) && (
                    <div className="hv-section">
                      <h3 className="hv-section-title">PROJECTS</h3>
                      {resume.projects.filter(p => p.name).map(proj => (
                        <div key={proj.id} className="hv-entry">
                          <div className="hv-row">
                            <strong className="hv-left">{proj.name}</strong>
                            <span className="hv-right" style={{ fontStyle: 'italic' }}>{proj.tech}</span>
                          </div>
                          <ul className="hv-bullets" style={{ marginTop: '0.2rem' }}>
                            <li>{proj.description}</li>
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {resume.skills.length > 0 && (
                    <div className="hv-section">
                      <h3 className="hv-section-title">SKILLS</h3>
                      <div className="hv-skills">
                        {resume.skills.join(', ')}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedTemplate.layout === 'minimalist' && (
                <div className="layout-minimalist">
                  <div className="mn-header">
                    <h1 className="mn-name" style={{ color: selectedTemplate.accent }}>{resume.personal.name || 'Your Name'}</h1>
                    <p className="mn-title">{resume.personal.title}</p>
                    <div className="mn-contact">
                      {[resume.personal.email, resume.personal.phone, resume.personal.location, resume.personal.linkedin].filter(Boolean).join('  •  ')}
                    </div>
                  </div>

                  {resume.summary && (
                    <div className="mn-section">
                      <p className="mn-summary">{resume.summary}</p>
                    </div>
                  )}

                  {resume.experience.some(e => e.company || e.role) && (
                    <div className="mn-section">
                      <h3 className="mn-section-title" style={{ color: selectedTemplate.accent }}>Experience</h3>
                      {resume.experience.filter(e => e.company || e.role).map(exp => (
                        <div key={exp.id} className="mn-entry">
                          <div className="mn-entry-left">
                            <div className="mn-date">{exp.startDate}<br/>|<br/>{exp.current ? 'Present' : exp.endDate}</div>
                          </div>
                          <div className="mn-entry-right">
                            <div className="mn-role">{exp.role}</div>
                            <div className="mn-company">{exp.company}</div>
                            <ul className="mn-bullets">
                              {exp.bullets.filter(b => b).map((b, i) => <li key={i}>{b}</li>)}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {resume.education.some(e => e.school || e.degree) && (
                    <div className="mn-section">
                      <h3 className="mn-section-title" style={{ color: selectedTemplate.accent }}>Education</h3>
                      {resume.education.filter(e => e.school || e.degree).map(edu => (
                        <div key={edu.id} className="mn-entry">
                          <div className="mn-entry-left">
                            <div className="mn-date">{edu.startDate}<br/>|<br/>{edu.endDate}</div>
                          </div>
                          <div className="mn-entry-right">
                            <div className="mn-role">{edu.degree} {edu.field && `in ${edu.field}`}</div>
                            <div className="mn-company">{edu.school} {edu.gpa && `• GPA: ${edu.gpa}`}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {resume.skills.length > 0 && (
                    <div className="mn-section">
                      <h3 className="mn-section-title" style={{ color: selectedTemplate.accent }}>Skills</h3>
                      <div className="mn-entry">
                        <div className="mn-entry-left"></div>
                        <div className="mn-entry-right" style={{ fontSize: '0.85rem' }}>
                          {resume.skills.join(', ')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!resume.personal.name && !resume.summary && resume.skills.length === 0 && (
                <div style={{ textAlign: 'center', color: '#999', marginTop: '3rem', fontSize: '0.9rem' }}>
                  Start filling in the form to see your live preview here ✨
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
