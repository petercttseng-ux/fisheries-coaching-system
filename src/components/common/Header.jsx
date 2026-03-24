import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../../contexts/AppContext.jsx'
import { toast } from 'react-toastify'

const FRILogo = () => (
  <img
    src={`${import.meta.env.BASE_URL}fri-logo.jpg`}
    alt="FRI Logo"
    style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.6)' }}
    onError={e => { e.target.style.display='none' }}
  />
)

const roleLabels = { admin: '系統管理員', manager: '管理人員', researcher: '研究人員' }
const roleBadgeClass = { admin: 'badge-red', manager: 'badge-blue', researcher: 'badge-teal' }

export default function Header() {
  const { currentUser, logout, tasks } = useContext(AppContext)
  const navigate = useNavigate()
  const [showNotif, setShowNotif] = useState(false)

  const pendingTasks = tasks.filter(t =>
    t.status !== 'completed' && (currentUser?.role === 'admin' || currentUser?.role === 'manager' || t.assignee === currentUser?.name)
  )

  const overdueTasks = pendingTasks.filter(t => {
    const due = new Date(t.dueDate)
    return due < new Date() && t.status !== 'completed'
  })

  const handleLogout = () => {
    logout()
    toast.info('已成功登出系統')
    navigate('/', { replace: true })
  }

  const initials = currentUser?.name?.slice(0, 2) || '用戶'

  return (
    <header className="header">
      <div className="header-left">
        <FRILogo />
        <div>
          <div className="header-title">水試所產銷班輔導應用系統</div>
          <div style={{ fontSize: '0.7rem', opacity: 0.75 }}>農業部水產試驗所</div>
        </div>
      </div>

      <div className="header-right">
        <div style={{ position: 'relative' }}>
          <button
            className="notification-btn"
            onClick={() => setShowNotif(s => !s)}
            title="待辦通知"
          >
            🔔
            {overdueTasks.length > 0 && (
              <span className="notification-badge">{overdueTasks.length}</span>
            )}
          </button>

          {showNotif && (
            <div style={{
              position: 'absolute', top: '110%', right: 0, width: 300,
              background: 'white', border: '1px solid #e2e8f0',
              borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              zIndex: 500, overflow: 'hidden'
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>
                通知 {overdueTasks.length > 0 && <span className={`badge badge-red`} style={{ marginLeft: 6 }}>{overdueTasks.length} 逾期</span>}
              </div>
              {overdueTasks.length === 0 && pendingTasks.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                  目前沒有待辦事項
                </div>
              ) : (
                <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                  {overdueTasks.slice(0, 5).map(t => (
                    <div
                      key={t.id}
                      style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', fontSize: '0.82rem' }}
                      onClick={() => { navigate(`/tasks/${t.id}`); setShowNotif(false) }}
                    >
                      <div style={{ color: '#ef4444', fontWeight: 600 }}>⚠️ 逾期任務</div>
                      <div style={{ color: '#0f172a' }}>{t.title}</div>
                      <div style={{ color: '#94a3b8' }}>截止：{t.dueDate} · 負責：{t.assignee}</div>
                    </div>
                  ))}
                  {pendingTasks.filter(t => new Date(t.dueDate) >= new Date()).slice(0, 3).map(t => (
                    <div
                      key={t.id}
                      style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', fontSize: '0.82rem' }}
                      onClick={() => { navigate(`/tasks/${t.id}`); setShowNotif(false) }}
                    >
                      <div style={{ color: '#0891b2', fontWeight: 600 }}>📋 待處理任務</div>
                      <div style={{ color: '#0f172a' }}>{t.title}</div>
                      <div style={{ color: '#94a3b8' }}>截止：{t.dueDate}</div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ padding: '10px 16px', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
                <button className="btn btn-sm btn-outline" onClick={() => { navigate('/tasks'); setShowNotif(false) }}>
                  查看全部任務
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="header-user">
          <div className="header-avatar">{initials}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.3 }}>{currentUser?.name}</div>
            <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>
              <span className={`badge ${roleBadgeClass[currentUser?.role] || 'badge-gray'}`} style={{ fontSize: '0.68rem' }}>
                {roleLabels[currentUser?.role] || currentUser?.role}
              </span>
            </div>
          </div>
        </div>

        <button className="header-btn" onClick={handleLogout}>
          🚪 登出
        </button>
      </div>
    </header>
  )
}
