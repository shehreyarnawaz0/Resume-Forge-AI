import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const columns = [
  { id: 'applied', label: '📩 Applied', color: '#6366f1' },
  { id: 'interview', label: '🗣 Interview', color: '#f59e0b' },
  { id: 'offer', label: '🎉 Offer', color: '#10b981' },
  { id: 'rejected', label: '❌ Rejected', color: '#ef4444' },
]

function loadJobs() {
  try {
    const saved = localStorage.getItem('rf-jobs')
    if (saved) return JSON.parse(saved)
  } catch {}
  return { applied: [], interview: [], offer: [], rejected: [] }
}

export default function JobTracker() {
  const [jobs, setJobs] = useState(loadJobs)
  const [showForm, setShowForm] = useState(false)
  const [editingJob, setEditingJob] = useState(null)
  const [form, setForm] = useState({ company: '', role: '', notes: '', status: 'applied', date: new Date().toISOString().slice(0, 10) })
  const [dragTarget, setDragTarget] = useState(null)

  useEffect(() => {
    localStorage.setItem('rf-jobs', JSON.stringify(jobs))
  }, [jobs])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.company.trim() || !form.role.trim()) return

    if (editingJob) {
      // Remove from old column
      setJobs(prev => {
        const updated = { ...prev }
        for (const col of Object.keys(updated)) {
          updated[col] = updated[col].filter(j => j.id !== editingJob.id)
        }
        updated[form.status] = [...updated[form.status], { ...editingJob, ...form }]
        return updated
      })
      setEditingJob(null)
    } else {
      const job = { id: Date.now(), ...form }
      setJobs(prev => ({
        ...prev,
        [form.status]: [...prev[form.status], job]
      }))
    }

    setForm({ company: '', role: '', notes: '', status: 'applied', date: new Date().toISOString().slice(0, 10) })
    setShowForm(false)
  }

  const handleEdit = (job, colId) => {
    setEditingJob(job)
    setForm({ company: job.company, role: job.role, notes: job.notes || '', status: colId, date: job.date })
    setShowForm(true)
  }

  const handleDelete = (jobId) => {
    setJobs(prev => {
      const updated = { ...prev }
      for (const col of Object.keys(updated)) {
        updated[col] = updated[col].filter(j => j.id !== jobId)
      }
      return updated
    })
  }

  const moveJob = (jobId, fromCol, toCol) => {
    if (fromCol === toCol) return
    setJobs(prev => {
      const job = prev[fromCol].find(j => j.id === jobId)
      if (!job) return prev
      return {
        ...prev,
        [fromCol]: prev[fromCol].filter(j => j.id !== jobId),
        [toCol]: [...prev[toCol], job],
      }
    })
  }

  const handleDragStart = (e, jobId, fromCol) => {
    e.dataTransfer.setData('jobId', jobId.toString())
    e.dataTransfer.setData('fromCol', fromCol)
  }

  const handleDragOver = (e, colId) => {
    e.preventDefault()
    setDragTarget(colId)
  }

  const handleDragLeave = () => {
    setDragTarget(null)
  }

  const handleDrop = (e, toCol) => {
    e.preventDefault()
    setDragTarget(null)
    const jobId = parseInt(e.dataTransfer.getData('jobId'))
    const fromCol = e.dataTransfer.getData('fromCol')
    moveJob(jobId, fromCol, toCol)
  }

  const totalJobs = Object.values(jobs).reduce((a, c) => a + c.length, 0)

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="badge badge-cyan" style={{ marginBottom: '0.75rem' }}>💼 Job Tracker</div>
          <h1 className="section-title">Track Your Applications</h1>
          <p className="section-sub" style={{ marginBottom: 0 }}>{totalJobs} job{totalJobs !== 1 ? 's' : ''} tracked · Drag cards between columns</p>
        </div>
        <button className="btn-primary" onClick={() => { setShowForm(true); setEditingJob(null); setForm({ company: '', role: '', notes: '', status: 'applied', date: new Date().toISOString().slice(0, 10) }) }}>
          ➕ Add Job
        </button>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowForm(false)}
          >
            <motion.form
              className="modal-card glass-card"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              onSubmit={handleSubmit}
            >
              <h3 style={{ marginBottom: '1.25rem', fontSize: '1.1rem', fontWeight: 700 }}>
                {editingJob ? '✏️ Edit Job' : '➕ Add New Job'}
              </h3>
              <div className="form-group">
                <label className="form-label">Company</label>
                <input className="glass-input" value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} placeholder="Google" required />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <input className="glass-input" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} placeholder="Senior Software Engineer" required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Date Applied</label>
                  <input type="date" className="glass-input" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="glass-input" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                    {columns.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="glass-input" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3} placeholder="Interview prep notes, contacts, etc." />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  {editingJob ? '💾 Update' : '➕ Add'}
                </button>
                <button type="button" className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kanban Board */}
      <div className="kanban-board">
        {columns.map(col => (
          <div
            key={col.id}
            className={`kanban-column ${dragTarget === col.id ? 'kanban-drop-active' : ''}`}
            onDragOver={e => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={e => handleDrop(e, col.id)}
          >
            <div className="kanban-header">
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{col.label}</span>
              <span className="kanban-count" style={{ background: `${col.color}33`, color: col.color }}>
                {jobs[col.id].length}
              </span>
            </div>
            <div className="kanban-cards">
              <AnimatePresence>
                {jobs[col.id].map(job => (
                  <motion.div
                    key={job.id}
                    className="kanban-card glass-card"
                    draggable
                    onDragStart={e => handleDragStart(e, job.id, col.id)}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    style={{ borderLeft: `3px solid ${col.color}` }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                      <strong style={{ fontSize: '0.9rem' }}>{job.company}</strong>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button className="kanban-action" onClick={() => handleEdit(job, col.id)} title="Edit">✏️</button>
                        <button className="kanban-action" onClick={() => handleDelete(job.id)} title="Delete">🗑</button>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{job.role}</p>
                    {job.notes && (
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '0.25rem' }}>{job.notes}</p>
                    )}
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {new Date(job.date).toLocaleDateString()}
                    </p>

                    {/* Move buttons */}
                    <div className="kanban-move-btns">
                      {columns.filter(c => c.id !== col.id).map(c => (
                        <button
                          key={c.id}
                          className="kanban-move-btn"
                          onClick={() => moveJob(job.id, col.id, c.id)}
                          style={{ borderColor: `${c.color}44` }}
                          title={`Move to ${c.label}`}
                        >
                          → {c.label.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {jobs[col.id].length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  Drop jobs here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
