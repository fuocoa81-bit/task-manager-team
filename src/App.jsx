import { useMemo, useState } from 'react'
import { COPILOT_URL, initialData, members, priorityClass, statusClass } from './data.js'

const emptyDraft = {
  title: '',
  owner: 'Federico Ramella',
  project: '',
  due: '',
  priority: 'Media',
  description: ''
}

const navItems = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'tasks', label: 'Task' },
  { key: 'ai', label: 'Inbox AI' },
  { key: 'investors', label: 'Investitori' },
  { key: 'pbsa', label: 'PBSA' },
  { key: 'team', label: 'Team' }
]

export default function App() {
  const [data, setData] = useState(initialData)
  const [tab, setTab] = useState('dashboard')
  const [query, setQuery] = useState('')
  const [ownerFilter, setOwnerFilter] = useState('Tutti')
  const [newTaskOpen, setNewTaskOpen] = useState(false)
  const [draft, setDraft] = useState(emptyDraft)
  const [editingSuggestion, setEditingSuggestion] = useState(null)
  const [toast, setToast] = useState('')

  const notify = (message) => {
    setToast(message)
    if (notify.timer) clearTimeout(notify.timer)
    notify.timer = setTimeout(() => setToast(''), 2200)
  }

  const openCopilot = () => {
    window.open(COPILOT_URL, '_blank', 'noopener,noreferrer')
  }

  const updateTask = (taskId, patch) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === taskId ? { ...task, ...patch } : task
      )
    }))
    notify('Task aggiornata')
  }

  const deleteTask = (taskId) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((task) => task.id !== taskId)
    }))
    notify('Task eliminata')
  }

  const addTask = () => {
    if (!draft.title.trim()) {
      notify('Inserisci un titolo')
      return
    }

    const task = {
      id: crypto.randomUUID(),
      title: draft.title.trim(),
      owner: draft.owner,
      project: draft.project || 'Da classificare',
      due: draft.due || 'Da definire',
      priority: draft.priority,
      status: 'Da fare',
      progress: 0,
      source: 'Inserimento manuale',
      description: draft.description || 'Nessuna descrizione'
    }

    setData((prev) => ({
      ...prev,
      tasks: [task, ...prev.tasks]
    }))
    setDraft(emptyDraft)
    setNewTaskOpen(false)
    notify('Task creata')
  }

  const approveSuggestion = (item) => {
    const task = {
      id: crypto.randomUUID(),
      title: item.suggestion,
      owner: item.owner,
      project: item.project,
      due: item.due,
      priority: item.sender === 'Fabio Carlozzo' ? 'Alta' : 'Media',
      status: 'Da fare',
      progress: 0,
      source: `Email ${item.sender}`,
      description: item.evidence
    }

    setData((prev) => ({
      ...prev,
      suggestions: prev.suggestions.filter((s) => s.id !== item.id),
      tasks: [task, ...prev.tasks]
    }))
    notify('Proposta approvata')
  }

  const rejectSuggestion = (id) => {
    setData((prev) => ({
      ...prev,
      suggestions: prev.suggestions.filter((s) => s.id !== id)
    }))
    notify('Proposta rifiutata')
  }

  const filteredTasks = useMemo(() => {
    return data.tasks.filter((task) => {
      const ownerMatch = ownerFilter === 'Tutti' || task.owner === ownerFilter
      const q = query.trim().toLowerCase()
      const textMatch = q.length === 0 || `${task.title} ${task.project} ${task.owner}`.toLowerCase().includes(q)
      return ownerMatch && textMatch
    })
  }, [data.tasks, ownerFilter, query])

  const metrics = [
    { label: 'Task aperte', value: data.tasks.filter((task) => task.status !== 'Completata').length },
    { label: 'Inbox AI', value: data.suggestions.length },
    { label: 'Bloccate', value: data.tasks.filter((task) => task.status === 'Bloccata').length },
    {
      label: 'Avanzamento medio',
      value: `${Math.round(data.tasks.reduce((sum, task) => sum + task.progress, 0) / data.tasks.length)}%`
    }
  ]

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <div className="brand-mark">T</div>
          <div className="brand-copy">
            <h1>TaskFlow AI</h1>
            <span>Capital Markets & Living</span>
          </div>
        </div>

        <div className="topbar-actions">
          <span className="user-pill">Utente: Antonio Fuoco</span>
          <button className="ghost-button" onClick={openCopilot}>
            Agente Copilot
          </button>
        </div>
      </header>

      <main className="layout">
        <aside className="sidebar">
          <nav className="nav">
            {navItems.map((item) => (
              <button
                key={item.key}
                className={`nav-item ${tab === item.key ? 'active' : ''}`}
                onClick={() => setTab(item.key)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <section className="content">
          <div className="hero-panel">
            <div>
              <span className="eyebrow">Demo Ready</span>
              <h2>Cabina di regia del team</h2>
              <p>
                Gestisci attività, proposte AI, investitori e progetti PBSA da un unico cruscotto.
              </p>
            </div>

            <button className="primary-button" onClick={() => setTab('ai')}>
              Apri Inbox AI
            </button>
          </div>

          <div className="metrics-row">
            {metrics.map((metric) => (
              <div key={metric.label} className="metric-card">
                <span className="metric-label">{metric.label}</span>
                <strong>{metric.value}</strong>
              </div>
            ))}
          </div>

          {tab === 'dashboard' && (
            <div className="panel-grid">
              <div className="panel">
                <div className="panel-header">
                  <h3>Priorità operative</h3>
                </div>

                <div className="task-stack">
                  {data.tasks
                    .filter((task) => task.status !== 'Completata')
                    .slice(0, 5)
                    .map((task) => (
                      <div key={task.id} className="mini-task-card">
                        <div>
                          <h4>{task.title}</h4>
                          <small>{task.owner} · {task.project}</small>
                        </div>

                        <div className="mini-badges">
                          <span className={priorityClass[task.priority]}>{task.priority}</span>
                          <span className={statusClass[task.status]}>{task.status}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <h3>Daily brief</h3>
                </div>

                <div className="team-brief">
                  {members.map((member) => {
                    const memberTasks = data.tasks.filter((task) => task.owner === member.name)
                    const active = memberTasks.filter((task) => task.status !== 'Completata')

                    return (
                      <div key={member.id} className="team-row">
                        <div className="member-tag">{member.initials}</div>
                        <div className="member-copy">
                          <strong>{member.name}</strong>
                          <span>{active.length} task aperte</span>
                        </div>
                        <span className="soft-tag">{active[0]?.title || 'Nessuna attività'}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {tab === 'tasks' && (
            <div className="panel">
              <div className="toolbar">
                <div className="search-box">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Cerca task..."
                  />
                </div>

                <select value={ownerFilter} onChange={(e) => setOwnerFilter(e.target.value)}>
                  <option value="Tutti">Tutti</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.name}>
                      {member.name}
                    </option>
                  ))}
                </select>

                <button className="primary-button" onClick={() => setNewTaskOpen(true)}>
                  + Nuova task
                </button>
              </div>

              <div className="task-list">
                {filteredTasks.map((task) => (
                  <div key={task.id} className="task-row">
                    <div className="task-main">
                      <div className="task-title-wrap">
                        <input
                          type="checkbox"
                          checked={task.status === 'Completata'}
                          onChange={(e) =>
                            updateTask(task.id, {
                              status: e.target.checked ? 'Completata' : 'Da fare',
                              progress: e.target.checked ? 100 : 0
                            })
                          }
                        />
                        <div>
                          <h4>{task.title}</h4>
                          <p>
                            {task.owner} · {task.project}
                          </p>
                        </div>
                      </div>

                      <div className="task-meta">
                        <span className={priorityClass[task.priority]}>{task.priority}</span>
                        <span className={statusClass[task.status]}>{task.status}</span>
                      </div>
                    </div>

                    <div className="task-middle">
                      <small>Scadenza: {task.due}</small>
                      <div className="progress-wrap">
                        <div className="progress-bar" style={{ width: `${task.progress}%` }} />
                      </div>
                    </div>

                    <div className="task-actions">
                      <button
                        className="ghost-button small"
                        onClick={() =>
                          updateTask(task.id, {
                            progress: Math.min(task.progress + 25, 100),
                            status: task.progress >= 75 ? 'Completata' : 'In corso'
                          })
                        }
                      >
                        Avanza
                      </button>

                      <button
                        className="ghost-button small danger"
                        onClick={() => deleteTask(task.id)}
                      >
                        Elimina
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'ai' && (
            <div className="panel-grid">
              <div className="panel">
                <div className="panel-header">
                  <h3>Proposte dell’agente</h3>
                </div>

                <div className="inbox-list">
                  {data.suggestions.map((item) => (
                    <div key={item.id} className="suggestion-card">
                      <div className="suggestion-header">
                        <span className="confidence-badge">Confidenza {item.confidence}%</span>
                        <button className="ghost-button small" onClick={() => setEditingSuggestion(item)}>
                          Modifica
                        </button>
                      </div>

                      <h4>{item.suggestion}</h4>
                      <p className="muted">
                        {item.sender} · {item.subject}
                      </p>

                      <blockquote>“{item.evidence}”</blockquote>

                      <div className="suggestion-actions">
                        <button className="primary-button small" onClick={() => approveSuggestion(item)}>
                          Approva
                        </button>

                        <button className="ghost-button small danger" onClick={() => rejectSuggestion(item.id)}>
                          Rifiuta
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel accent-panel">
                <div className="panel-header">
                  <h3>Copilot Center</h3>
                </div>

                <p className="muted-copy">
                  L’agente propone azioni, owner e scadenze. Antonio convalida prima della creazione.
                </p>

                <button className="primary-button full" onClick={openCopilot}>
                  Apri agente
                </button>
              </div>
            </div>
          )}

          {tab === 'investors' && (
            <div className="panel">
              <div className="panel-header">
                <h3>Investor Tracker</h3>
              </div>

              <div className="cards-grid">
                {data.investors.map((investor) => (
                  <div key={investor.id} className="info-card">
                    <div className="info-card-top">
                      <div className="mini-mark">I</div>
                      <span className={priorityClass[investor.priority]}>{investor.priority}</span>
                    </div>

                    <h4>{investor.name}</h4>
                    <p className="muted">{investor.stage}</p>

                    <div className="info-list">
                      <div>
                        <label>Owner</label>
                        <span>{investor.owner}</span>
                      </div>
                      <div>
                        <label>Prossima azione</label>
                        <span>{investor.nextAction}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'pbsa' && (
            <div className="panel">
              <div className="panel-header">
                <h3>PBSA Tracker</h3>
              </div>

              <div className="pbsa-list">
                {data.projects.map((project) => (
                  <div key={project.id} className="pbsa-row">
                    <div className="pbsa-main">
                      <strong>{project.name}</strong>
                      <span>{project.phase}</span>
                    </div>

                    <div>{project.owner}</div>
                    <div>{project.milestone}</div>

                    <div className="pbsa-progress">
                      <div className="progress-line">
                        <div className="progress-bar" style={{ width: `${project.progress}%` }} />
                      </div>
                      <small>{project.progress}%</small>
                    </div>

                    <span className="soft-tag risk-tag">{project.risk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'team' && (
            <div className="panel">
              <div className="panel-header">
                <h3>Team</h3>
              </div>

              <div className="cards-grid">
                {members.map((member) => {
                  const memberTasks = data.tasks.filter((task) => task.owner === member.name)
                  const openTasks = memberTasks.filter((task) => task.status !== 'Completata')
                  const avg = memberTasks.length
                    ? Math.round(memberTasks.reduce((sum, task) => sum + task.progress, 0) / memberTasks.length)
                    : 0

                  return (
                    <div key={member.id} className="team-card">
                      <div className="member-header">
                        <div className="member-badge">{member.initials}</div>
                        <div>
                          <h4>{member.name}</h4>
                          <span>{openTasks.length} task aperte</span>
                        </div>
                      </div>

                      <div className="mini-progress">
                        <div className="progress-line">
                          <div className="progress-bar" style={{ width: `${avg}%` }} />
                        </div>
                        <small>{avg}%</small>
                      </div>

                      <button
                        className="ghost-button full"
                        onClick={() => {
                          setOwnerFilter(member.name)
                          setTab('tasks')
                        }}
                      >
                        Vedi attività
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </section>
      </main>

      {newTaskOpen && (
        <div className="modal-backdrop" onClick={() => setNewTaskOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Crea nuova task</h3>
              <button onClick={() => setNewTaskOpen(false)}>×</button>
            </div>

            <div className="modal-body">
              <input
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="Titolo attività"
              />

              <div className="two-col">
                <select
                  value={draft.owner}
                  onChange={(e) => setDraft({ ...draft, owner: e.target.value })}
                >
                  {members.map((member) => (
                    <option key={member.id} value={member.name}>
                      {member.name}
                    </option>
                  ))}
                </select>

                <select
                  value={draft.priority}
                  onChange={(e) => setDraft({ ...draft, priority: e.target.value })}
                >
                  <option value="Alta">Alta</option>
                  <option value="Media">Media</option>
                  <option value="Bassa">Bassa</option>
                </select>
              </div>

              <div className="two-col">
                <input
                  value={draft.project}
                  onChange={(e) => setDraft({ ...draft, project: e.target.value })}
                  placeholder="Progetto"
                />
                <input
                  value={draft.due}
                  onChange={(e) => setDraft({ ...draft, due: e.target.value })}
                  placeholder="Scadenza"
                />
              </div>

              <textarea
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                rows={4}
                placeholder="Contesto e output atteso"
              />

              <div className="modal-actions">
                <button className="ghost-button" onClick={() => setNewTaskOpen(false)}>
                  Annulla
                </button>
                <button className="primary-button" onClick={addTask}>
                  Crea task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingSuggestion && (
        <div className="modal-backdrop" onClick={() => setEditingSuggestion(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Modifica proposta AI</h3>
              <button onClick={() => setEditingSuggestion(null)}>×</button>
            </div>

            <div className="modal-body">
              <input
                value={editingSuggestion.suggestion}
                onChange={(e) =>
                  setEditingSuggestion({
                    ...editingSuggestion,
                    suggestion: e.target.value
                  })
                }
              />

              <select
                value={editingSuggestion.owner}
                onChange={(e) =>
                  setEditingSuggestion({
                    ...editingSuggestion,
                    owner: e.target.value
                  })
                }
              >
                {members.map((member) => (
                  <option key={member.id} value={member.name}>
                    {member.name}
                  </option>
                ))}
              </select>

              <input
                value={editingSuggestion.due}
                onChange={(e) =>
                  setEditingSuggestion({
                    ...editingSuggestion,
                    due: e.target.value
                  })
                }
              />

              <div className="modal-actions">
                <button className="ghost-button" onClick={() => setEditingSuggestion(null)}>
                  Annulla
                </button>
                <button
                  className="primary-button"
                  onClick={() => {
                    setData((prev) => ({
                      ...prev,
                      suggestions: prev.suggestions.map((s) =>
                        s.id === editingSuggestion.id ? { ...s, ...editingSuggestion } : s
                      )
                    }))
                    setEditingSuggestion(null)
                    notify('Proposta aggiornata')
                  }}
                >
                  Salva
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
