import React, { useContext } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { AppContext } from '../../contexts/AppContext.jsx'

const FRILogoSmall = () => (
  <svg viewBox="0 0 200 200" width="38" height="38" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="95" fill="rgba(8,145,178,0.2)" stroke="#22d3ee" strokeWidth="5"/>
    <ellipse cx="100" cy="105" rx="45" ry="25" fill="none" stroke="#22d3ee" strokeWidth="3" transform="rotate(-15 100 105)"/>
    <path d="M140 90 L160 75 L155 95 L165 110 L140 100 Z" fill="#22d3ee" opacity="0.8"/>
    <circle cx="75" cy="97" r="4" fill="#22d3ee"/>
    <path d="M55 115 Q100 70 150 95" fill="none" stroke="#0d9488" strokeWidth="3"/>
  </svg>
)

const navItems = [
  { path: '/dashboard', icon: '📊', label: '儀表板', section: 'main' },
  { path: '/guidance', icon: '📝', label: '輔導記錄', section: 'main' },
  { path: '/tasks', icon: '✅', label: '交辦事項', section: 'main' },
  { path: '/map', icon: '🗺️', label: '地圖展示', section: 'main' },
  { path: '/reports', icon: '📈', label: '統計報表', section: 'main' },
  { path: '/users', icon: '👥', label: '帳號管理', section: 'admin', adminOnly: true },
]

export default function Sidebar() {
  const { currentUser, tasks, guidanceRecords } = useContext(AppContext)
  const location = useLocation()

  const pendingTaskCount = tasks.filter(t =>
    t.status !== 'completed' &&
    (currentUser?.role === 'admin' || currentUser?.role === 'manager' || t.assignee === currentUser?.name)
  ).length

  const pendingReviewCount = guidanceRecords.filter(r => r.status === 'submitted').length

  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <FRILogoSmall />
        <div className="sidebar-logo-text">
          <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>水試所</div>
          <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>產銷班輔導系統</div>
        </div>
      </div>

      <div className="sidebar-nav">
        <div className="sidebar-section-title">主要功能</div>

        {navItems.filter(item => !item.adminOnly).map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.path === '/tasks' && pendingTaskCount > 0 && (
              <span style={{
                background: '#ef4444', color: 'white', borderRadius: 10,
                padding: '1px 7px', fontSize: '0.7rem', fontWeight: 700
              }}>{pendingTaskCount}</span>
            )}
            {item.path === '/guidance' && pendingReviewCount > 0 && (currentUser?.role === 'manager' || currentUser?.role === 'admin') && (
              <span style={{
                background: '#f59e0b', color: 'white', borderRadius: 10,
                padding: '1px 7px', fontSize: '0.7rem', fontWeight: 700
              }}>{pendingReviewCount}</span>
            )}
          </NavLink>
        ))}

        {currentUser?.role === 'admin' && (
          <>
            <div className="sidebar-section-title" style={{ marginTop: 12 }}>系統管理</div>
            {navItems.filter(item => item.adminOnly).map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              >
                <span className="sidebar-link-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </>
        )}
      </div>

      <div className="sidebar-footer">
        <div style={{ marginBottom: 4 }}>
          <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>目前登入</span>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500, fontSize: '0.82rem' }}>
            {currentUser?.name}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem' }}>
            {currentUser?.dept}
          </div>
        </div>
        <div style={{ fontSize: '0.7rem', opacity: 0.4, marginTop: 6 }}>v1.0.0 © 2024 水試所</div>
      </div>
    </nav>
  )
}
