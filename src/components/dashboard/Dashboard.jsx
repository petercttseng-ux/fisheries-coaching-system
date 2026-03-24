import React, { useContext, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../../contexts/AppContext.jsx'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'

const COLORS = ['#0891b2', '#0d9488', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#ec4899']

const statusLabels = { draft: '草稿', submitted: '已提交', reviewed: '已審核' }
const priorityLabels = { high: '高', medium: '中', low: '低' }
const statusClass = { draft: 'badge-draft', submitted: 'badge-submitted', reviewed: 'badge-reviewed' }
const priorityClass = { high: 'badge-high', medium: 'badge-medium', low: 'badge-low' }

export default function Dashboard() {
  const { guidanceRecords, tasks, currentUser } = useContext(AppContext)
  const navigate = useNavigate()

  const now = new Date()
  const thisMonth = now.toISOString().slice(0, 7)
  const myRecords = currentUser?.role === 'researcher'
    ? guidanceRecords.filter(r => r.friAttendees?.includes(currentUser.name))
    : guidanceRecords

  const stats = useMemo(() => {
    const totalRecords = myRecords.length
    const thisMonthRecords = myRecords.filter(r => r.date?.startsWith(thisMonth)).length
    const pendingTasks = tasks.filter(t =>
      t.status !== 'completed' &&
      (currentUser?.role !== 'researcher' || t.assignee === currentUser?.name)
    ).length
    const completedTasks = tasks.filter(t => t.status === 'completed').length
    const regions = new Set(myRecords.map(r => r.county)).size
    const overdue = tasks.filter(t => {
      const due = new Date(t.dueDate)
      return due < now && t.status !== 'completed' &&
        (currentUser?.role !== 'researcher' || t.assignee === currentUser?.name)
    }).length
    return { totalRecords, thisMonthRecords, pendingTasks, completedTasks, regions, overdue }
  }, [myRecords, tasks, currentUser, now, thisMonth])

  const industryData = useMemo(() => {
    const counts = {}
    myRecords.forEach(r => { counts[r.industry] = (counts[r.industry] || 0) + 1 })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [myRecords])

  const monthlyData = useMemo(() => {
    const months = {}
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = d.toISOString().slice(0, 7)
      const label = `${d.getMonth() + 1}月`
      months[key] = { month: label, 輔導次數: 0 }
    }
    myRecords.forEach(r => {
      const key = r.date?.slice(0, 7)
      if (months[key]) months[key].輔導次數++
    })
    return Object.values(months)
  }, [myRecords, now])

  const recentRecords = [...myRecords].sort((a, b) => b.date?.localeCompare(a.date)).slice(0, 6)
  const urgentTasks = tasks
    .filter(t => t.status !== 'completed' && (currentUser?.role !== 'researcher' || t.assignee === currentUser?.name))
    .sort((a, b) => a.dueDate?.localeCompare(b.dueDate))
    .slice(0, 5)

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-title">📊 儀表板</div>
          <div className="page-subtitle">歡迎回來，{currentUser?.name}！今天是 {now.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</div>
        </div>
        <div className="page-header-right">
          <button className="btn btn-primary" onClick={() => navigate('/guidance/new')}>
            ➕ 新增輔導記錄
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        {[
          { icon: '📝', label: '新增輔導', action: () => navigate('/guidance/new') },
          { icon: '✅', label: '查看任務', action: () => navigate('/tasks') },
          { icon: '🗺️', label: '地圖展示', action: () => navigate('/map') },
          { icon: '📈', label: '統計報表', action: () => navigate('/reports') },
          { icon: '🔍', label: '搜尋記錄', action: () => navigate('/guidance') },
        ].map((item, i) => (
          <button key={i} className="quick-action-btn" onClick={item.action}>
            <span className="quick-action-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon cyan">📋</div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalRecords}</div>
            <div className="stat-label">輔導記錄總數</div>
            <div className="stat-change up">本月 +{stats.thisMonthRecords}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber">⏰</div>
          <div className="stat-info">
            <div className="stat-value">{stats.pendingTasks}</div>
            <div className="stat-label">待完成任務</div>
            {stats.overdue > 0 && <div className="stat-change down">⚠️ {stats.overdue} 件逾期</div>}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div className="stat-info">
            <div className="stat-value">{stats.completedTasks}</div>
            <div className="stat-label">已完成任務</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon teal">🗺️</div>
          <div className="stat-info">
            <div className="stat-value">{stats.regions}</div>
            <div className="stat-label">涵蓋縣市數</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">🏭 產業別分布</div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={industryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {industryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">📅 近六個月輔導次數</div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="輔導次數" fill="#0891b2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Records & Tasks */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <span className="card-title">📝 最近輔導記錄</span>
            <button className="btn btn-sm btn-outline" onClick={() => navigate('/guidance')}>查看全部</button>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>日期</th>
                  <th>縣市</th>
                  <th>班組名稱</th>
                  <th>狀態</th>
                </tr>
              </thead>
              <tbody>
                {recentRecords.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: 20, color: '#94a3b8' }}>尚無資料</td></tr>
                ) : recentRecords.map(r => (
                  <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/guidance/${r.id}`)}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.82rem' }}>{r.date}</td>
                    <td><span className="badge badge-cyan" style={{ fontSize: '0.72rem' }}>{r.county}</span></td>
                    <td style={{ fontSize: '0.82rem', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.groupName}</td>
                    <td><span className={`badge ${statusClass[r.status]}`} style={{ fontSize: '0.7rem' }}>{statusLabels[r.status]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">⚡ 待辦任務</span>
            <button className="btn btn-sm btn-outline" onClick={() => navigate('/tasks')}>查看全部</button>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>任務標題</th>
                  <th>負責人</th>
                  <th>優先</th>
                  <th>截止</th>
                </tr>
              </thead>
              <tbody>
                {urgentTasks.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: 20, color: '#94a3b8' }}>目前無待辦任務 🎉</td></tr>
                ) : urgentTasks.map(t => {
                  const isOverdue = new Date(t.dueDate) < now
                  return (
                    <tr key={t.id} className={isOverdue ? 'overdue-row' : ''} style={{ cursor: 'pointer' }} onClick={() => navigate(`/tasks/${t.id}`)}>
                      <td style={{ fontSize: '0.82rem', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {isOverdue && '⚠️ '}{t.title}
                      </td>
                      <td style={{ fontSize: '0.82rem' }}>{t.assignee}</td>
                      <td><span className={`badge ${priorityClass[t.priority]}`} style={{ fontSize: '0.7rem' }}>{priorityLabels[t.priority]}</span></td>
                      <td style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{t.dueDate}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
