import React, { useContext, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../../contexts/AppContext.jsx'
import { departments, counties, industries } from '../../data/personnel.js'

const statusLabels = { draft: '草稿', submitted: '已提交', reviewed: '已審核' }
const statusClass = { draft: 'badge-draft', submitted: 'badge-submitted', reviewed: 'badge-reviewed' }
const PAGE_SIZE = 10

function exportCSV(records) {
  const headers = ['記錄編號', '日期', '縣市', '班組名稱', '產業類別', '主要產品', '水試所人員', '狀態']
  const rows = records.map(r => [
    r.recordNo, r.date, r.county, r.groupName, r.industry, r.product,
    (r.friAttendees || []).join('、'), statusLabels[r.status] || r.status
  ])
  const csv = [headers, ...rows].map(row => row.map(c => `"${String(c || '').replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = `輔導記錄_${new Date().toISOString().slice(0, 10)}.csv`
  a.click(); URL.revokeObjectURL(url)
}

export default function GuidanceList() {
  const { guidanceRecords, currentUser } = useContext(AppContext)
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filterDept, setFilterDept] = useState('')
  const [filterCounty, setFilterCounty] = useState('')
  const [filterIndustry, setFilterIndustry] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [page, setPage] = useState(1)

  const visible = currentUser?.role === 'researcher'
    ? guidanceRecords.filter(r => r.friAttendees?.includes(currentUser.name) || r.createdBy === currentUser.name)
    : guidanceRecords

  const filtered = useMemo(() => {
    return visible.filter(r => {
      if (search && !r.groupName?.includes(search) && !r.county?.includes(search) && !r.product?.includes(search) && !r.recordNo?.includes(search)) return false
      if (filterCounty && r.county !== filterCounty) return false
      if (filterIndustry && r.industry !== filterIndustry) return false
      if (filterStatus && r.status !== filterStatus) return false
      if (filterDateFrom && r.date < filterDateFrom) return false
      if (filterDateTo && r.date > filterDateTo) return false
      return true
    }).sort((a, b) => b.date?.localeCompare(a.date))
  }, [visible, search, filterCounty, filterIndustry, filterStatus, filterDateFrom, filterDateTo])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const resetFilters = () => {
    setSearch(''); setFilterDept(''); setFilterCounty(''); setFilterIndustry('')
    setFilterStatus(''); setFilterDateFrom(''); setFilterDateTo(''); setPage(1)
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-title">📝 輔導記錄</div>
          <div className="page-subtitle">共 {filtered.length} 筆記錄</div>
        </div>
        <div className="page-header-right">
          <button className="btn btn-secondary" onClick={() => exportCSV(filtered)}>⬇️ 匯出 CSV</button>
          <button className="btn btn-primary" onClick={() => navigate('/guidance/new')}>➕ 新增記錄</button>
        </div>
      </div>

      <div className="filters-bar">
        <div className="search-input-wrapper" style={{ flex: 2 }}>
          <span className="search-icon">🔍</span>
          <input
            className="form-control search-input"
            placeholder="搜尋班組名稱、縣市、產品..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <select className="form-control" style={{ width: 'auto', minWidth: 110 }} value={filterCounty} onChange={e => { setFilterCounty(e.target.value); setPage(1) }}>
          <option value="">全部縣市</option>
          {counties.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="form-control" style={{ width: 'auto', minWidth: 120 }} value={filterIndustry} onChange={e => { setFilterIndustry(e.target.value); setPage(1) }}>
          <option value="">全部產業</option>
          {industries.map(i => <option key={i} value={i}>{i}</option>)}
        </select>
        <select className="form-control" style={{ width: 'auto', minWidth: 110 }} value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }}>
          <option value="">全部狀態</option>
          <option value="draft">草稿</option>
          <option value="submitted">已提交</option>
          <option value="reviewed">已審核</option>
        </select>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '0.82rem', color: '#64748b', whiteSpace: 'nowrap' }}>日期：</span>
          <input type="date" className="form-control" style={{ width: 140 }} value={filterDateFrom} onChange={e => { setFilterDateFrom(e.target.value); setPage(1) }} />
          <span style={{ color: '#94a3b8' }}>~</span>
          <input type="date" className="form-control" style={{ width: 140 }} value={filterDateTo} onChange={e => { setFilterDateTo(e.target.value); setPage(1) }} />
        </div>
        <button className="btn btn-sm btn-secondary" onClick={resetFilters}>重置</button>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>記錄編號</th>
                <th>輔導日期</th>
                <th>縣市</th>
                <th>班組名稱</th>
                <th>產業類別</th>
                <th>主要產品</th>
                <th>水試所人員</th>
                <th>狀態</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="empty-state">
                      <div className="empty-state-icon">📋</div>
                      <div className="empty-state-text">尚無符合條件的輔導記錄</div>
                      <div className="empty-state-sub">請調整篩選條件或新增輔導記錄</div>
                    </div>
                  </td>
                </tr>
              ) : paged.map(r => (
                <tr key={r.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#0891b2' }}>{r.recordNo}</td>
                  <td style={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }}>{r.date}</td>
                  <td><span className="badge badge-cyan" style={{ fontSize: '0.72rem' }}>{r.county}</span></td>
                  <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.875rem' }} title={r.groupName}>{r.groupName}</td>
                  <td><span className="badge badge-teal" style={{ fontSize: '0.72rem' }}>{r.industry}</span></td>
                  <td style={{ maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.82rem' }}>{r.product}</td>
                  <td style={{ fontSize: '0.82rem' }}>{(r.friAttendees || []).join('、')}</td>
                  <td><span className={`badge ${statusClass[r.status]}`} style={{ fontSize: '0.72rem' }}>{statusLabels[r.status]}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-sm btn-outline" onClick={() => navigate(`/guidance/${r.id}`)}>查看</button>
                      {(currentUser?.role !== 'researcher' || r.createdBy === currentUser?.name) && r.status !== 'reviewed' && (
                        <button className="btn btn-sm btn-secondary" onClick={() => navigate(`/guidance/edit/${r.id}`)}>編輯</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
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
