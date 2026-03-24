import React, { useContext, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppContext } from '../../contexts/AppContext.jsx'
import { toast } from 'react-toastify'

const statusLabels = { pending: '待處理', inprogress: '進行中', completed: '已完成' }
const statusClass = { pending: 'badge-pending', inprogress: 'badge-inprogress', completed: 'badge-completed' }
const priorityLabels = { high: '高', medium: '中', low: '低' }
const priorityClass = { high: 'badge-high', medium: 'badge-medium', low: 'badge-low' }

export default function TaskDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { tasks, guidanceRecords, currentUser, updateTask, addProgressUpdate } = useContext(AppContext)
  const [progressNote, setProgressNote] = useState('')
  const [progressVal, setProgressVal] = useState(0)
  const [newStatus, setNewStatus] = useState('')
  const [comment, setComment] = useState('')

  const task = tasks.find(t => t.id === id)
  if (!task) return (
    <div className="empty-state">
      <div className="empty-state-icon">🔍</div>
      <div className="empty-state-text">找不到此任務</div>
      <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/tasks')}>返回任務列表</button>
    </div>
  )

  const relatedRecord = guidanceRecords.find(r => r.id === task.guidanceId)
  const now = new Date()
  const isOverdue = new Date(task.dueDate) < now && task.status !== 'completed'
  const canUpdate = currentUser?.role === 'admin' || currentUser?.role === 'manager' || task.assignee === currentUser?.name

  const handleStatusChange = (status) => {
    const prog = status === 'completed' ? 100 : task.progress
    updateTask(id, { status, progress: prog })
    toast.success(`任務狀態已更新為：${statusLabels[status]}`)
  }

  const handleProgressUpdate = () => {
    if (!progressNote.trim()) { toast.error('請輸入進度說明'); return }
    const status = progressVal >= 100 ? 'completed' : progressVal > 0 ? 'inprogress' : task.status
    addProgressUpdate(id, {
      note: progressNote,
      progress: Math.min(100, Math.max(0, Number(progressVal))),
      status,
      author: currentUser?.name,
    })
    setProgressNote('')
    toast.success('進度已更新')
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span className={`badge ${statusClass[task.status]}`}>{statusLabels[task.status]}</span>
            <span className={`badge ${priorityClass[task.priority]}`}>優先度：{priorityLabels[task.priority]}</span>
            {isOverdue && <span className="badge badge-red">⚠️ 已逾期</span>}
          </div>
          <div className="page-title" style={{ fontSize: '1.2rem' }}>{task.taskNo}</div>
          <div className="page-subtitle">{task.title}</div>
        </div>
        <div className="page-header-right">
          <button className="btn btn-secondary" onClick={() => navigate('/tasks')}>← 返回列表</button>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div>
          {/* Task Info */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header"><span className="card-title">📋 任務資訊</span></div>
            <div className="card-body">
              <div className="grid-2" style={{ gap: 12, marginBottom: 16 }}>
                {[
                  ['任務編號', task.taskNo],
                  ['負責人', task.assignee],
                  ['截止日期', task.dueDate],
                  ['建立日期', task.createdAt],
                  ['最後更新', task.updatedAt],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>{label}</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 500, marginTop: 2, color: label === '截止日期' && isOverdue ? '#ef4444' : undefined }}>{value}</div>
                  </div>
                ))}
              </div>

              {task.description && (
                <div style={{ marginBottom: 16, padding: '12px', background: '#f8fdfe', borderRadius: 8, border: '1px solid #b2ebf2' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0891b2', marginBottom: 4 }}>任務說明</div>
                  <p style={{ fontSize: '0.875rem', lineHeight: 1.7, color: '#334155' }}>{task.description}</p>
                </div>
              )}

              {/* Progress */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 600 }}>執行進度</span>
                  <span style={{ color: '#0891b2', fontWeight: 700 }}>{task.progress}%</span>
                </div>
                <div className="progress-bar" style={{ height: 10, borderRadius: 5 }}>
                  <div className="progress-fill" style={{
                    width: `${task.progress}%`,
                    background: task.progress === 100 ? '#10b981' : isOverdue ? '#ef4444' : undefined
                  }} />
                </div>
              </div>
            </div>
          </div>

          {/* Related Record */}
          {relatedRecord && (
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-header"><span className="card-title">🔗 關聯輔導記錄</span></div>
              <div className="card-body">
                <div style={{ cursor: 'pointer', padding: '10px', background: '#f0fdfa', borderRadius: 8, border: '1px solid #b2ebf2' }}
                  onClick={() => navigate(`/guidance/${relatedRecord.id}`)}>
                  <div style={{ fontWeight: 600, color: '#0891b2' }}>{relatedRecord.recordNo}</div>
                  <div style={{ fontSize: '0.85rem', color: '#334155', marginTop: 2 }}>{relatedRecord.groupName}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>{relatedRecord.date} · {relatedRecord.county}</div>
                </div>
              </div>
            </div>
          )}

          {/* Status Control */}
          {canUpdate && (
            <div className="card">
              <div className="card-header"><span className="card-title">🔄 更新狀態</span></div>
              <div className="card-body">
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <button
                      key={key}
                      className={`btn ${task.status === key ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => handleStatusChange(key)}
                      disabled={task.status === key}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          {/* Progress Update Form */}
          {canUpdate && task.status !== 'completed' && (
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-header"><span className="card-title">📊 更新進度</span></div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">進度百分比：{progressVal}%</label>
                  <input
                    type="range" min={0} max={100} step={5}
                    value={progressVal}
                    onChange={e => setProgressVal(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#0891b2' }}
                  />
                  <div className="progress-bar" style={{ marginTop: 6 }}>
                    <div className="progress-fill" style={{ width: `${progressVal}%` }} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label required">進度說明</label>
                  <textarea
                    className="form-control" rows={3}
                    placeholder="請說明本次進度更新內容..."
                    value={progressNote}
                    onChange={e => setProgressNote(e.target.value)}
                  />
                </div>
                <button className="btn btn-primary" onClick={handleProgressUpdate}>送出進度更新</button>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="card">
            <div className="card-header"><span className="card-title">📅 進度紀錄</span></div>
            <div className="card-body">
              {(task.updates || []).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '0.85rem' }}>尚無進度更新記錄</div>
              ) : (
                <div className="timeline">
                  {[...task.updates].reverse().map(u => (
                    <div key={u.id} className="timeline-item">
                      <div className={`timeline-dot ${u.progress >= 100 ? 'success' : u.progress >= 50 ? '' : 'warning'}`} />
                      <div className="timeline-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{u.author}</div>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <span style={{ background: '#e0f7fa', color: '#006064', borderRadius: 10, padding: '1px 8px', fontSize: '0.72rem', fontWeight: 600 }}>
                              {u.progress}%
                            </span>
                          </div>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.6 }}>{u.note}</p>
                        <div className="timeline-date">{u.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
