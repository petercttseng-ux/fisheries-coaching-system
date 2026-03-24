import React, { useContext, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../../contexts/AppContext.jsx'

const statusLabels = { pending: '待處理', inprogress: '進行中', completed: '已完成' }
const statusClass = { pending: 'badge-pending', inprogress: 'badge-inprogress', completed: 'badge-completed' }
const priorityLabels = { high: '高', medium: '中', low: '低' }
const priorityClass = { high: 'badge-high', medium: 'badge-medium', low: 'badge-low' }
const PAGE_SIZE = 12

export default function TaskList() {
  const { tasks, currentUser } = useContext(AppContext)
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [filterAssignee, setFilterAssignee] = useState('')
  const [page, setPage] = useState(1)

  const now = new Date()

  const myTasks = currentUser?.role === 'researcher'
    ? tasks.filter(t => t.assignee === currentUser.name)
    : tasks

  const filtered = useMemo(() => {
    return myTasks.filter(t => {
      if (activeTab === 'pending' && t.status !== 'pending') return false
      if (activeTab === 'inprogress' && t.status !== 'inprogress') return false
      if (activeTab === 'completed' && t.status !== 'completed') return false
      if (activeTab === 'overdue' && (new Date(t.dueDate) >= now || t.status === 'completed')) return false
      if (search && !t.title?.includes(search) && !t.taskNo?.includes(search) && !t.assignee?.includes(search)) return false
      if (filterPriority && t.priority !== filterPriority) return false
      if (filterAssignee && t.assignee !== filterAssignee) return false
      return true
    }).sort((a, b) => a.dueDate?.localeCompare(b.dueDate))
  }, [myTasks, activeTab, search, filterPriority, filterAssignee, now])

  const counts = useMemo(() => ({
    all: myTasks.length,
    pending: myTasks.filter(t => t.status === 'pending').length,
    inprogress: myTasks.filter(t => t.status === 'inprogress').length,
    completed: myTasks.filter(t => t.status === 'completed').length,
    overdue: myTasks.filter(t => new Date(t.dueDate) < now && t.status !== 'completed').length,
  }), [myTasks, now])

  const assignees = [...new Set(myTasks.map(t => t.assignee))].filter(Boolean).sort()
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-title">✅ 交辦事項管理</div>
          <div className="page-subtitle">追蹤輔導工作進度與執行狀況</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {[
          { key: 'all', label: '全部' },
          { key: 'pending', label: '待處理' },
          { key: 'inprogress', label: '進行中' },
          { key: 'completed', label: '已完成' },
          { key: 'overdue', label: '⚠️ 逾期', danger: true },
        ].map(tab => (
          <div key={tab.key} className={`tab${activeTab === tab.key ? ' active' : ''}`} onClick={() => { setActiveTab(tab.key); setPage(1) }}
            style={tab.danger && counts.overdue > 0 ? { color: activeTab === tab.key ? '#ef4444' : '#94a3b8' } : {}}>
            {tab.label}
            <span className="tab-count" style={tab.danger && counts.overdue > 0 ? { background: '#fce4ec', color: '#ef4444' } : {}}>
              {counts[tab.key]}
            </span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-input-wrapper" style={{ flex: 2 }}>
          <span className="search-icon">🔍</span>
          <input
            className="form-control search-input"
            placeholder="搜尋任務編號、標題或負責人..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <select className="form-control" style={{ width: 'auto', minWidth: 110 }} value={filterPriority} onChange={e => { setFilterPriority(e.target.value); setPage(1) }}>
          <option value="">全部優先度</option>
          <option value="high">高</option>
          <option value="medium">中</option>
          <option value="low">低</option>
        </select>
        {currentUser?.role !== 'researcher' && (
          <select className="form-control" style={{ width: 'auto', minWidth: 120 }} value={filterAssignee} onChange={e => { setFilterAssignee(e.target.value); setPage(1) }}>
            <option value="">全部負責人</option>
            {assignees.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        )}
        <button className="btn btn-sm btn-secondary" onClick={() => { setSearch(''); setFilterPriority(''); setFilterAssignee(''); setPage(1) }}>重置</button>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>任務編號</th>
                <th>任務標題</th>
                <th>負責人</th>
                <th>截止日期</th>
                <th>優先度</th>
                <th>狀態</th>
                <th>進度</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <div className="empty-state-icon">✅</div>
                      <div className="empty-state-text">
                        {activeTab === 'completed' ? '尚無已完成的任務' :
                         activeTab === 'overdue' ? '沒有逾期任務！👏' : '目前沒有符合條件的任務'}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : paged.map(t => {
                const isOverdue = new Date(t.dueDate) < now && t.status !== 'completed'
                const daysLeft = Math.ceil((new Date(t.dueDate) - now) / (1000 * 60 * 60 * 24))
                return (
                  <tr key={t.id} className={isOverdue ? 'overdue-row' : ''}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#0891b2' }}>{t.taskNo}</td>
                    <td style={{ maxWidth: 220, fontSize: '0.875rem' }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={t.title}>
                        {isOverdue && <span style={{ color: '#ef4444', marginRight: 4 }}>⚠️</span>}
                        {t.title}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.875rem' }}>{t.assignee}</td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                      <div>{t.dueDate}</div>
                      {!isOverdue && t.status !== 'completed' && daysLeft <= 7 && (
                        <div style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 600 }}>
                          {daysLeft <= 0 ? '今日截止' : `剩 ${daysLeft} 天`}
                        </div>
                      )}
                      {isOverdue && <div style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 600 }}>逾期 {Math.abs(daysLeft)} 天</div>}
                    </td>
                    <td><span className={`badge ${priorityClass[t.priority]}`} style={{ fontSize: '0.72rem' }}>{priorityLabels[t.priority]}</span></td>
                    <td><span className={`badge ${statusClass[t.status]}`} style={{ fontSize: '0.72rem' }}>{statusLabels[t.status]}</span></td>
                    <td style={{ minWidth: 100 }}>
                      <div className="progress-bar" style={{ marginBottom: 2 }}>
                        <div className="progress-fill" style={{
                          width: `${t.progress}%`,
                          background: t.progress === 100 ? '#10b981' : isOverdue ? '#ef4444' : undefined
                        }} />
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{t.progress}%</div>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline" onClick={() => navigate(`/tasks/${t.id}`)}>詳情</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <div className="pagination-info">
            顯示第 {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} 筆，共 {filtered.length} 筆
          </div>
          <div className="pagination-controls">
            <button className="page-btn" disabled={page === 1} onClick={() => setPage(1)}>«</button>
            <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
              return p <= totalPages ? (
                <button key={p} className={`page-btn${p === page ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ) : null
            })}
            <button className="page-btn" disabled={page === totalPages || totalPages === 0} onClick={() => setPage(p => p + 1)}>›</button>
            <button className="page-btn" disabled={page === totalPages || totalPages === 0} onClick={() => setPage(totalPages)}>»</button>
          </div>
        </div>
      </div>
    </div>
  )
}
