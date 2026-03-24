import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../../contexts/AppContext.jsx'

const FRILogo = () => (
  <svg viewBox="0 0 200 200" width="90" height="90" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="95" fill="#e0f7fa" stroke="#0891b2" strokeWidth="4"/>
    <circle cx="100" cy="100" r="85" fill="none" stroke="#0891b2" strokeWidth="2"/>
    <ellipse cx="100" cy="105" rx="45" ry="25" fill="none" stroke="#0d9488" strokeWidth="3" transform="rotate(-15 100 105)"/>
    <path d="M140 90 L160 75 L155 95 L165 110 L140 100 Z" fill="#0d9488" opacity="0.8"/>
    <circle cx="75" cy="97" r="4" fill="#0d9488"/>
    <path d="M55 115 Q100 70 150 95" fill="none" stroke="#0891b2" strokeWidth="3"/>
    <path id="topArc" d="M 20 100 A 80 80 0 0 1 180 100" fill="none"/>
    <text fontSize="12" fill="#0891b2" fontWeight="bold">
      <textPath href="#topArc" startOffset="10%">農業部水產試驗所</textPath>
    </text>
    <text x="100" y="178" textAnchor="middle" fontSize="9" fill="#0891b2" fontWeight="bold">FISHERIES RESEARCH INSTITUTE</text>
  </svg>
)

export default function Login() {
  const { login } = useContext(AppContext)
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '', remember: false })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) {
      setError('請輸入帳號及密碼')
      return
    }
    setLoading(true)
    setError('')
    await new Promise(r => setTimeout(r, 400))
    const result = login(form.username, form.password)
    setLoading(false)
    if (result.success) {
      navigate('/dashboard', { replace: true })
    } else {
      setError(result.error)
    }
  }

  const demoLogin = (username, password) => {
    setForm(f => ({ ...f, username, password }))
  }

  return (
    <div className="login-page">
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <FRILogo />
            </div>
            <div className="login-title">水試所產銷班輔導應用系統</div>
            <div className="login-subtitle">農業部水產試驗所 · Fisheries Research Institute</div>
          </div>

          <div className="login-body">
            {error && <div className="login-error">⚠️ {error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="login-form-group">
                <label className="login-label">帳號</label>
                <input
                  type="text"
                  className="login-input"
                  placeholder="請輸入帳號"
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  autoFocus
                  autoComplete="username"
                />
              </div>

              <div className="login-form-group">
                <label className="login-label">密碼</label>
                <input
                  type="password"
                  className="login-input"
                  placeholder="請輸入密碼"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  autoComplete="current-password"
                />
              </div>

              <label className="login-remember">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={e => setForm(f => ({ ...f, remember: e.target.checked }))}
                />
                記住帳號
              </label>

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? '登入中...' : '登入系統'}
              </button>
            </form>

            <div style={{ marginTop: 20, padding: '14px', background: '#f8fdfe', borderRadius: 8, border: '1px solid #b2ebf2' }}>
              <div style={{ fontSize: '0.78rem', color: '#546e7a', marginBottom: 8, fontWeight: 600 }}>示範帳號快速登入：</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-sm btn-outline" onClick={() => demoLogin('admin', 'admin123')}>
                  管理員
                </button>
                <button type="button" className="btn btn-sm btn-outline" onClick={() => demoLogin('manager1', 'mgr123')}>
                  所長
                </button>
                <button type="button" className="btn btn-sm btn-outline" onClick={() => demoLogin('柯慧玲', 'fri2024')}>
                  研究員
                </button>
              </div>
            </div>
          </div>

          <div className="login-footer">
            © {new Date().getFullYear()} 農業部水產試驗所 版權所有<br />
            本系統僅供水試所人員使用
          </div>
        </div>
      </div>
    </div>
  )
}
