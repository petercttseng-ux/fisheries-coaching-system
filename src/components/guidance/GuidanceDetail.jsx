import React, { useContext, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppContext } from '../../contexts/AppContext.jsx'
import { toast } from 'react-toastify'

const CHECKLIST_ITEMS = [
  { key: 'production', label: '生產技術指導' },
  { key: 'quality', label: '品質管理' },
  { key: 'marketing', label: '行銷輔導' },
  { key: 'regulation', label: '法規遵循' },
  { key: 'environment', label: '環境管理' },
]

const statusLabels = { draft: '草稿', submitted: '已提交', reviewed: '已審核' }
const statusClass = { draft: 'badge-draft', submitted: 'badge-submitted', reviewed: 'badge-reviewed' }
const priorityLabels = { high: '高', medium: '中', low: '低' }
const priorityClass = { high: 'badge-high', medium: 'badge-medium', low: 'badge-low' }
const taskStatusLabels = { pending: '待處理', inprogress: '進行中', completed: '已完成' }
const taskStatusClass = { pending: 'badge-pending', inprogress: 'badge-inprogress', completed: 'badge-completed' }

export default function GuidanceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { guidanceRecords, tasks, currentUser, addComment, updateRecord, deleteRecord } = useContext(AppContext)
  const [comment, setComment] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const record = guidanceRecords.find(r => r.id === id)
  if (!record) return (
    <div className="empty-state">
      <div className="empty-state-icon">🔍</div>
      <div className="empty-state-text">找不到此輔導記錄</div>
      <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/guidance')}>返回列表</button>
    </div>
  )

  const relatedTasks = tasks.filter(t => (record.tasks || []).includes(t.id))

  const handleComment = () => {
    if (!comment.trim()) return
    addComment(id, { author: currentUser?.name, role: currentUser?.role, text: comment })
    setComment('')
    toast.success('評論已送出')
  }

  const handleReview = () => {
    updateRecord(id, { status: 'reviewed' })
    toast.success('已標記為已審核')
  }

  const handleDelete = () => {
    deleteRecord(id)
    toast.success('輔導記錄已刪除')
    navigate('/guidance')
  }

  const handlePrint = () => window.print()

  const canEdit = currentUser?.role === 'admin' || record.createdBy === currentUser?.name
  const canReview = (currentUser?.role === 'admin' || currentUser?.role === 'manager') && record.status === 'submitted'

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-title">
            <span className={`badge ${statusClass[record.status]}`} style={{ marginRight: 10, fontSize: '0.85rem' }}>
              {statusLabels[record.status]}
            </span>
            {record.recordNo}
          </div>
          <div className="page-subtitle">輔導日期：{record.date} · 縣市：{record.county}</div>
        </div>
        <div className="page-header-right">
          <button className="btn btn-secondary" onClick={handlePrint}>🖨️ 列印</button>
          {canEdit && record.status !== 'reviewed' && (
            <button className="btn btn-secondary" onClick={() => navigate(`/guidance/edit/${id}`)}>✏️ 編輯</button>
          )}
          {canReview && (
            <button className="btn btn-success" onClick={handleReview}>✅ 標記審核通過</button>
          )}
          {(currentUser?.role === 'admin') && (
            <button className="btn btn-danger" onClick={() => setShowDeleteConfirm(true)}>🗑️ 刪除</button>
          )}
          <button className="btn btn-secondary" onClick={() => navigate('/guidance')}>← 返回列表</button>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div>
          {/* Basic Info */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header"><span className="card-title">📌 基本資訊</span></div>
            <div className="card-body">
              <div className="grid-2" style={{ gap: 12 }}>
                {[
                  ['輔導日期', record.date],
                  ['縣市', record.county],
                  ['班組名稱', record.groupName],
                  ['產業類別', record.industry],
                  ['主要產品', record.product],
                  ['建立者', record.createdBy],
                  ['建立日期', record.createdAt],
                  ['最後更新', record.updatedAt],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>{label}</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 500, marginTop: 2 }}>{value || '—'}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Attendees */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header"><span className="card-title">👥 出席人員</span></div>
            <div className="card-body">
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0891b2', marginBottom: 6 }}>水試所人員</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {(record.friAttendees || []).map(name => (
                    <span key={name} className="badge badge-cyan">{name}</span>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0d9488', marginBottom: 6 }}>產銷班人員</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {(record.groupAttendees || []).map((g, i) => (
                    <span key={i} className="badge badge-teal">{g.name}{g.role ? `（${g.role}）` : ''}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header"><span className="card-title">☑️ 輔導項目</span></div>
            <div className="card-body">
              <ul className="checklist">
                {CHECKLIST_ITEMS.map(item => (
                  <li key={item.key} className="checklist-item" style={{ cursor: 'default' }}>
                    <span style={{ fontSize: '1rem' }}>{record.checklist?.[item.key] ? '✅' : '⬜'}</span>
                    <span style={{ color: record.checklist?.[item.key] ? '#0f172a' : '#94a3b8' }}>{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div>
          {/* Summary */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header"><span className="card-title">📄 輔導摘要</span></div>
            <div className="card-body">
              <p style={{ lineHeight: 1.8, color: '#334155', whiteSpace: 'pre-wrap' }}>{record.summary}</p>
            </div>
          </div>

          {/* Tasks */}
          {relatedTasks.length > 0 && (
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-header">
                <span className="card-title">✅ 交辦事項</span>
                <button className="btn btn-sm btn-outline" onClick={() => navigate('/tasks')}>查看全部</button>
              </div>
              <div>
                {relatedTasks.map(t => {
                  const isOverdue = new Date(t.dueDate) < new Date() && t.status !== 'completed'
                  return (
                    <div key={t.id} style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }} onClick={() => navigate(`/tasks/${t.id}`)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: isOverdue ? '#ef4444' : '#0f172a' }}>
                            {isOverdue && '⚠️ '}{t.title}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>
                            負責：{t.assignee} · 截止：{t.dueDate}
                          </div>
                          <div style={{ marginTop: 6 }}>
                            <div className="progress-bar">
                              <div className="progress-fill" style={{ width: `${t.progress}%`, background: t.progress === 100 ? '#10b981' : undefined }} />
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>{t.progress}% 完成</div>
                          </div>
                        </div>
                        <div style={{ marginLeft: 12, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                          <span className={`badge ${priorityClass[t.priority]}`} style={{ fontSize: '0.7rem' }}>{priorityLabels[t.priority]}</span>
                          <span className={`badge ${taskStatusClass[t.status]}`} style={{ fontSize: '0.7rem' }}>{taskStatusLabels[t.status]}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="card">
            <div className="card-header"><span className="card-title">💬 評論與審核意見</span></div>
            <div className="card-body">
              {(record.comments || []).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '0.85rem' }}>尚無評論</div>
              ) : (
                <div className="timeline" style={{ marginBottom: 16 }}>
                  {record.comments.map(c => (
                    <div key={c.id} className="comment">
                      <div className="comment-avatar">{c.author?.slice(0, 2)}</div>
                      <div className="comment-bubble">
                        <div className="comment-header">
                          <span className="comment-author">{c.author}</span>
                          <span className="comment-date">{c.date}</span>
                        </div>
                        <div className="comment-text">{c.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {(currentUser?.role === 'manager' || currentUser?.role === 'admin') && (
                <div>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="輸入評論或審核意見..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                  />
                  <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={handleComment}>送出評論</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">確認刪除</span>
              <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="alert alert-danger">確定要刪除此輔導記錄嗎？此操作無法還原。</div>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>記錄編號：{record.recordNo}</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>取消</button>
              <button className="btn btn-danger" onClick={handleDelete}>確認刪除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
