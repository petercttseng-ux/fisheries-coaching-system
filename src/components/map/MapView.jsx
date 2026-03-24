import React, { useContext, useState, useMemo } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { AppContext } from '../../contexts/AppContext.jsx'
import { personnel, industries } from '../../data/personnel.js'

// County coordinates (Taiwan)
const COUNTY_COORDS = {
  '基隆市': [25.128, 121.740],
  '台北市': [25.047, 121.517],
  '臺北市': [25.047, 121.517],
  '新北市': [25.012, 121.466],
  '桃園市': [24.993, 121.301],
  '新竹市': [24.803, 120.971],
  '新竹縣': [24.838, 121.017],
  '苗栗縣': [24.560, 120.820],
  '臺中市': [24.147, 120.674],
  '彰化縣': [24.052, 120.516],
  '南投縣': [23.960, 120.972],
  '雲林縣': [23.707, 120.431],
  '嘉義縣': [23.480, 120.449],
  '嘉義市': [23.479, 120.449],
  '臺南市': [22.999, 120.227],
  '高雄市': [22.627, 120.302],
  '屏東縣': [22.551, 120.548],
  '宜蘭縣': [24.702, 121.737],
  '花蓮縣': [23.758, 121.520],
  '臺東縣': [22.798, 121.145],
  '澎湖縣': [23.565, 119.579],
  '金門縣': [24.432, 118.317],
  '連江縣': [26.160, 119.953],
}

const INDUSTRY_COLORS = {
  '海洋漁業': '#0891b2',
  '水產養殖': '#0d9488',
  '水產加工': '#f59e0b',
  '農漁業': '#10b981',
  '生態': '#8b5cf6',
  '漁業資源保育': '#ef4444',
  '漁業資源': '#ec4899',
}

export default function MapView() {
  const { guidanceRecords, currentUser } = useContext(AppContext)
  const [filterIndustry, setFilterIndustry] = useState('')
  const [selectedPerson, setSelectedPerson] = useState(null)

  const filteredPersonnel = useMemo(() => {
    return personnel.filter(p => {
      if (filterIndustry && p.industry !== filterIndustry) return false
      return true
    })
  }, [filterIndustry])

  const countyStats = useMemo(() => {
    const stats = {}
    guidanceRecords.forEach(r => {
      if (!stats[r.county]) stats[r.county] = 0
      stats[r.county]++
    })
    return stats
  }, [guidanceRecords])

  // Group personnel by county
  const byCounty = useMemo(() => {
    const grouped = {}
    filteredPersonnel.forEach(p => {
      if (!grouped[p.county]) grouped[p.county] = []
      grouped[p.county].push(p)
    })
    return grouped
  }, [filteredPersonnel])

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-title">🗺️ 地圖展示</div>
          <div className="page-subtitle">全台輔導地點分布與研究人員派駐情況</div>
        </div>
        <div className="page-header-right">
          <select
            className="form-control"
            style={{ width: 'auto', minWidth: 140 }}
            value={filterIndustry}
            onChange={e => setFilterIndustry(e.target.value)}
          >
            <option value="">全部產業別</option>
            {industries.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
      </div>

      {/* Stats row */}
      <div className="stats-grid" style={{ marginBottom: 16 }}>
        <div className="stat-card">
          <div className="stat-icon cyan">📍</div>
          <div className="stat-info">
            <div className="stat-value">{Object.keys(byCounty).length}</div>
            <div className="stat-label">涵蓋縣市</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon teal">👨‍🔬</div>
          <div className="stat-info">
            <div className="stat-value">{filteredPersonnel.length}</div>
            <div className="stat-label">研究人員</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber">🏭</div>
          <div className="stat-info">
            <div className="stat-value">{new Set(filteredPersonnel.map(p => p.industry)).size}</div>
            <div className="stat-label">產業類別</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">👥</div>
          <div className="stat-info">
            <div className="stat-value">{new Set(filteredPersonnel.map(p => p.group)).size}</div>
            <div className="stat-label">班組數</div>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start', gap: 20 }}>
        <div>
          <div className="card">
            <div className="card-header">
              <span className="card-title">🗺️ 台灣分布圖</span>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>點擊標記查看詳情</span>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="map-container" style={{ height: 520 }}>
                <MapContainer
                  center={[23.8, 120.9]}
                  zoom={7}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {Object.entries(byCounty).map(([county, persons]) => {
                    const coords = COUNTY_COORDS[county]
                    if (!coords) return null
                    const primaryIndustry = persons[0]?.industry
                    const color = INDUSTRY_COLORS[primaryIndustry] || '#64748b'
                    const recordCount = countyStats[county] || 0
                    const offset = [0, 0]
                    return (
                      <CircleMarker
                        key={county}
                        center={[coords[0] + offset[0], coords[1] + offset[1]]}
                        radius={Math.max(10, Math.min(25, 8 + persons.length * 2))}
                        fillColor={color}
                        color="white"
                        weight={2}
                        opacity={0.9}
                        fillOpacity={0.8}
                      >
                        <Popup>
                          <div style={{ minWidth: 200, fontFamily: 'Noto Sans TC, sans-serif' }}>
                            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0891b2', marginBottom: 8, borderBottom: '1px solid #e2e8f0', paddingBottom: 6 }}>
                              📍 {county}
                            </div>
                            <div style={{ fontSize: '0.85rem', marginBottom: 6, color: '#64748b' }}>
                              研究人員：{persons.length} 位 · 輔導記錄：{recordCount} 筆
                            </div>
                            <div style={{ maxHeight: 180, overflowY: 'auto' }}>
                              {persons.map(p => (
                                <div key={p.id} style={{ padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.82rem' }}>
                                  <div style={{ fontWeight: 600 }}>{p.name} <span style={{ color: '#94a3b8', fontWeight: 400 }}>{p.title}</span></div>
                                  <div style={{ color: '#0891b2', fontSize: '0.75rem' }}>{p.dept}</div>
                                  <div style={{ color: '#64748b', fontSize: '0.75rem' }}>班組：{p.group}</div>
                                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>產品：{p.product}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </Popup>
                      </CircleMarker>
                    )
                  })}
                </MapContainer>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="map-legend">
            <div style={{ width: '100%', fontWeight: 600, fontSize: '0.82rem', color: '#64748b', marginBottom: 4 }}>圖例（產業類別）：</div>
            {Object.entries(INDUSTRY_COLORS).map(([industry, color]) => (
              <div key={industry} className="legend-item">
                <div className="legend-dot" style={{ background: color }} />
                {industry}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="card">
            <div className="card-header"><span className="card-title">📋 縣市分布明細</span></div>
            <div style={{ maxHeight: 580, overflowY: 'auto' }}>
              {Object.entries(byCounty).sort((a, b) => b[1].length - a[1].length).map(([county, persons]) => (
                <div key={county} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{
                    padding: '10px 20px',
                    background: '#f8fdfe',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}>
                    <span>📍 {county}</span>
                    <span style={{ display: 'flex', gap: 6 }}>
                      <span className="badge badge-cyan">{persons.length} 人</span>
                      {countyStats[county] > 0 && <span className="badge badge-teal">{countyStats[county]} 筆記錄</span>}
                    </span>
                  </div>
                  {persons.map(p => (
                    <div key={p.id} style={{ padding: '8px 20px 8px 32px', fontSize: '0.82rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 500 }}>{p.name} <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{p.title}</span></div>
                        <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{p.dept} · {p.group}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.72rem' }}>{p.product}</div>
                      </div>
                      <span className="badge" style={{ background: INDUSTRY_COLORS[p.industry] + '20', color: INDUSTRY_COLORS[p.industry], fontSize: '0.68rem', flexShrink: 0, marginLeft: 8 }}>
                        {p.industry}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
