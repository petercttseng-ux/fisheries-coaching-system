import React, { useContext, useState, useMemo } from 'react'
import { AppContext } from '../../contexts/AppContext.jsx'
import { personnel, departments } from '../../data/personnel.js'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts'

const COLORS = ['#0891b2', '#0d9488', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#ec4899', '#f97316']

export default function Reports() {
  const { guidanceRecords, tasks, currentUser } = useContext(AppContext)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const filtered = useMemo(() => {
    return guidanceRecords.filter(r => {
      if (dateFrom && r.date < dateFrom) return false
      if (dateTo && r.date > dateTo) return false
      return true
    })
  }, [guidanceRecords, dateFrom, dateTo])

  // By department
  const byDept = useMemo(() => {
    const counts = {}
    filtered.forEach(r => {
      const p = personnel.find(p2 => r.friAttendees?.includes(p2.name))
      const dept = p?.dept || '其他'
      counts[dept] = (counts[dept] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [filtered])

  // By industry
  const byIndustry = useMemo(() => {
    const counts = {}
    filtered.forEach(r => { counts[r.industry] = (counts[r.industry] || 0) + 1 })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [filtered])

  // Monthly trend (last 12 months)
  const monthlyTrend = useMemo(() => {
    const months = {}
    const now = new Date()
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = d.toISOString().slice(0, 7)
      months[key] = { month: `${d.getMonth() + 1}月`, 輔導次數: 0, 記錄數: 0 }
    }
    filtered.forEach(r => {
      const key = r.date?.slice(0, 7)
      if (months[key]) months[key].輔導次數++
    })
    return Object.values(months)
  }, [filtered])

  // By county
  const byCounty = useMemo(() => {
    const counts = {}
    filtered.forEach(r => { counts[r.county] = (counts[r.county] || 0) + 1 })
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10)
  }, [filtered])

  // Researcher activity
  const researcherActivity = useMemo(() => {
    const activity = {}
    filtered.forEach(r => {
      (r.friAttendees || []).forEach(name => {
        if (!activity[name]) activity[name] = { name, records: 0, tasks: 0 }
        activity[name].records++
      })
    })
    tasks.forEach(t => {
      if (!activity[t.assignee]) activity[t.assignee] = { name: t.assignee, records: 0, tasks: 0 }
      if (activity[t.assignee]) activity[t.assignee].tasks++
    })
    return Object.values(activity).sort((a, b) => b.records - a.records).slice(0, 15)
  }, [filtered, tasks])

  // Summary stats
  const stats = useMemo(() => {
    const total = filtered.length
    const reviewed = filtered.filter(r => r.status === 'reviewed').length
    const submitted = filtered.filter(r => r.status === 'submitted').length
    const draft = filtered.filter(r => r.status === 'draft').length
    const completedTasks = tasks.filter(t => t.status === 'completed').length
    const totalTasks = tasks.length
    const completionRate = totalTasks > 0 ? Math.round(completedTasks / totalTasks * 100) : 0
    const counties = new Set(filtered.map(r => r.county)).size
    return { total, reviewed, submitted, draft, completedTasks, totalTasks, completionRate, counties }
  }, [filtered, tasks])

  const handleExport = () => {
    const rows = [
      ['統計報表', `產出日期：${new Date().toLocaleDateString('zh-TW')}`],
      [],
      ['輔導記錄統計'],
      ['指標', '數值'],
      ['輔導記錄總數', stats.total],
      ['已審核', stats.reviewed],
      ['已提交', stats.submitted],
      ['草稿', stats.draft],
      ['涵蓋縣市', stats.counties],
      ['任務完成率', `${stats.completionRate}%`],
      [],
      ['研究人員活動摘要'],
      ['姓名', '輔導記錄數', '交辦任務數'],
      ...researcherActivity.map(r => [r.name, r.records, r.tasks]),
    ]
    const csv = rows.map(r => r.map(c => `"${String(c || '')}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `統計報表_${new Date().toISOString().slice(0, 10)}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-title">📈 統計報表</div>
          <div className="page-subtitle">輔導工作成效分析與統計</div>
        </div>
        <div className="page-header-right">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>日期範圍：</span>
            <input type="date" className="form-control" style={{ width: 150 }} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            <span style={{ color: '#94a3b8' }}>~</span>
            <input type="date" className="form-control" style={{ width: 150 }} value={dateTo} onChange={e => setDateTo(e.target.value)} />
            {(dateFrom || dateTo) && <button className="btn btn-sm btn-secondary" onClick={() => { setDateFrom(''); setDateTo('') }}>清除</button>}
          </div>
          <button className="btn btn-primary" onClick={handleExport}>⬇️ 匯出報表</button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon cyan">📋</div>
          <div className="stat-info">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">輔導記錄總數</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div className="stat-info">
            <div className="stat-value">{stats.reviewed}</div>
            <div className="stat-label">已審核記錄</div>
            <div className="stat-change up">{stats.total > 0 ? Math.round(stats.reviewed / stats.total * 100) : 0}% 審核率</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon teal">🗺️</div>
          <div className="stat-info">
            <div className="stat-value">{stats.counties}</div>
            <div className="stat-label">涵蓋縣市</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber">⚡</div>
          <div className="stat-info">
            <div className="stat-value">{stats.completionRate}%</div>
            <div className="stat-label">任務完成率</div>
            <div className="stat-change up">{stats.completedTasks}/{stats.totalTasks} 任務</div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="charts-grid" style={{ marginBottom: 20 }}>
        <div className="chart-card">
          <div className="chart-header">🏢 各組別輔導次數</div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={byDept} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" name="輔導次數" fill="#0891b2" radius={[4, 4, 0, 0]}>
                  {byDept.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">🏭 產業別分布</div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={byIndustry} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}
                  label={({ name, percent }) => `${name.length > 4 ? name.slice(0, 4) + '..' : name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={true} fontSize={10}>
                  {byIndustry.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="charts-grid" style={{ marginBottom: 20 }}>
        <div className="chart-card">
          <div className="chart-header">📅 月度輔導趨勢（近12個月）</div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="輔導次數" stroke="#0891b2" strokeWidth={2} dot={{ fill: '#0891b2', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">📍 各縣市輔導次數 (Top 10)</div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byCounty} layout="vertical" margin={{ top: 5, right: 20, left: 50, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={55} />
                <Tooltip />
                <Bar dataKey="value" name="輔導次數" fill="#0d9488" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Researcher Activity Table */}
      <div className="card">
        <div className="card-header"><span className="card-title">👨‍🔬 研究人員活動摘要</span></div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>姓名</th>
                <th>部門</th>
                <th>縣市</th>
                <th>輔導記錄數</th>
                <th>交辦任務數</th>
                <th>活動指數</th>
              </tr>
            </thead>
            <tbody>
              {researcherActivity.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 20, color: '#94a3b8' }}>尚無活動記錄</td></tr>
              ) : researcherActivity.map((r, idx) => {
                const p = personnel.find(p2 => p2.name === r.name)
                const activityScore = r.records * 2 + r.tasks
                const maxScore = researcherActivity[0] ? researcherActivity[0].records * 2 + researcherActivity[0].tasks : 1
                const pct = Math.round(activityScore / maxScore * 100)
                return (
                  <tr key={r.name}>
                    <td style={{ color: '#94a3b8', fontSize: '0.82rem' }}>{idx + 1}</td>
                    <td style={{ fontWeight: 600 }}>{r.name}</td>
                    <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{p?.dept || '—'}</td>
                    <td><span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>{p?.county || '—'}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 700, color: '#0891b2' }}>{r.records}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#0d9488' }}>{r.tasks}</span>
                    </td>
                    <td style={{ minWidth: 120 }}>
                      <div className="progress-bar" style={{ marginBottom: 2 }}>
                        <div className="progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{pct}%</div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
