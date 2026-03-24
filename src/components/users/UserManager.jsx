import React, { useContext, useState, useMemo } from 'react'
import { AppContext } from '../../contexts/AppContext.jsx'
import { departments } from '../../data/personnel.js'
import { toast } from 'react-toastify'

const roleLabels = { admin: '系統管理員', manager: '管理人員', researcher: '研究人員' }
const roleBadgeClass = { admin: 'badge-red role-admin', manager: 'badge-blue role-manager', researcher: 'badge-teal role-researcher' }

const emptyForm = { username: '', password: '', name: '', role: 'researcher', dept: '', active: true }

export default function UserManager() {
  const { users, currentUser, addUser, updateUser, deleteUser } = useContext(AppContext)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const filtered = useMemo(() => {
    return users.filter(u => {
      if (search && !u.name?.includes(search) && !u.username?.includes(search) && !u.dept?.includes(search)) return false
      if (filterRole && u.role !== filterRole) return false
      return true
    })
  }, [users, search, filterRole])

  const openAdd = () => {
    setEditUser(null)
    setForm(emptyForm)
    setErrors({})
    setShowModal(true)
  }

  const openEdit = (user) => {
    setEditUser(user)
    setForm({ username: user.username, password: '', name: user.name, role: user.role, dept: user.dept || '', active: user.active !== false })
    setErrors({})
    setShowModal(true)
  }

  const validate = () => {
    const errs = {}
    if (!form.username.trim()) errs.username = '請輸入帳號'
    if (!editUser && !form.password.trim()) errs.password = '請輸入密碼'
    if (!form.name.trim()) errs.name = '請輸入姓名'
    if (!form.role) errs.role = '請選擇角色'
    if (form.username && !editUser && users.find(u => u.username === form.username)) errs.username = '此帳號已存在'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    if (editUser) {
      const updates = { ...form }
      if (!updates.password) delete updates.password
      updateUser(editUser.id, updates)
      toast.success('帳號已更新')
    } else {
      addUser(form)
      toast.success('帳號已新增')
    }
    setShowModal(false)
  }

  const handleDelete = (user) => {
    if (user.id === currentUser?.id) { toast.error('無法刪除自己的帳號'); return }
    deleteUser(user.id)
    setDeleteConfirm(null)
    toast.success('帳號已刪除')
  }

  const toggleActive = (user) => {
    if (user.id === currentUser?.id) { toast.error('無法停用自己的帳號'); return }
    updateUser(user.id, { active: !user.active })
    toast.success(user.active ? '帳號已停用' : '帳號已啟用')
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-title">👥 帳號管理</div>
          <div className="page-subtitle">管理系統使用者帳號與權限</div>
        </div>
        <div className="page-header-right">
          <button className="btn btn-primary" onClick={openAdd}>➕ 新增帳號</button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {[
          { label: '全部帳號', value: users.length, icon: '👥', cls: 'cyan' },
          { label: '管理人員', value: users.filter(u => u.role === 'manager').length, icon: '🏢', cls: 'blue' },
          { label: '研究人員', value: users.filter(u => u.role === 'researcher').length, icon: '🔬', cls: 'teal' },
          { label: '停用帳號', value: users.filter(u => u.active === false).length, icon: '🚫', cls: 'red' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
            <div className="stat-info">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-input-wrapper" style={{ flex: 2 }}>
          <span className="search-icon">🔍</span>
          <input className="form-control search-input" placeholder="搜尋姓名、帳號或部門..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-control" style={{ width: 'auto', minWidth: 120 }} value={filterRole} onChange={e => setFilterRole(e.target.value)}>
          <option value="">全部角色</option>
          <option value="admin">系統管理員</option>
          <option value="manager">管理人員</option>
          <option value="researcher">研究人員</option>
        </select>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>帳號</th>
                <th>姓名</th>
                <th>角色</th>
                <th>部門</th>
                <th>狀態</th>
                <th>建立日期</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state"><div className="empty-state-icon">👥</div><div className="empty-state-text">找不到符合條件的帳號</div></div></td></tr>
              ) : filtered.map(u => (
                <tr key={u.id} style={{ opacity: u.active === false ? 0.6 : 1 }}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.875rem', color: '#0891b2', fontWeight: 600 }}>{u.username}</td>
                  <td style={{ fontWeight: 500 }}>
                    {u.name}
                    {u.id === currentUser?.id && <span className="badge badge-amber" style={{ marginLeft: 6, fontSize: '0.68rem' }}>我</span>}
                  </td>
                  <td><span className={`badge ${roleBadgeClass[u.role]}`} style={{ fontSize: '0.75rem' }}>{roleLabels[u.role]}</span></td>
                  <td style={{ fontSize: '0.875rem' }}>{u.dept || '—'}</td>
                  <td>
                    <span className={`badge ${u.active !== false ? 'badge-green' : 'badge-gray'}`} style={{ fontSize: '0.75rem' }}>
                      {u.active !== false ? '啟用' : '停用'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{u.createdAt || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-sm btn-outline" onClick={() => openEdit(u)}>編輯</button>
                      <button
                        className={`btn btn-sm ${u.active !== false ? 'btn-warning' : 'btn-success'}`}
                        onClick={() => toggleActive(u)}
                        disabled={u.id === currentUser?.id}
                        style={{ fontSize: '0.75rem' }}
                      >
                        {u.active !== false ? '停用' : '啟用'}
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => setDeleteConfirm(u)} disabled={u.id === currentUser?.id}>刪除</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editUser ? '✏️ 編輯帳號' : '➕ 新增帳號'}</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label required">帳號</label>
                  <input type="text" className="form-control" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} disabled={Boolean(editUser)} />
                  {errors.username && <div className="form-error">{errors.username}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 500, fontSize: '0.85rem', color: '#475569' }}>
                    密碼{editUser && <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}> (留空表示不修改)</span>}
                  </label>
                  <input type="password" className="form-control" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder={editUser ? '不修改請留空' : ''} />
                  {errors.password && <div className="form-error">{errors.password}</div>}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label required">姓名</label>
                  <input type="text" className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  {errors.name && <div className="form-error">{errors.name}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label required">角色</label>
                  <select className="form-control" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                    <option value="researcher">研究人員</option>
                    <option value="manager">管理人員</option>
                    <option value="admin">系統管理員</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">部門</label>
                <select className="form-control" value={form.dept} onChange={e => setForm(f => ({ ...f, dept: e.target.value }))}>
                  <option value="">請選擇部門</option>
                  {['所長室', '秘書室', '資訊室', ...departments].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              {editUser && (
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.875rem' }}>
                    <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} style={{ accentColor: '#0891b2' }} />
                    帳號啟用中
                  </label>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>取消</button>
              <button className="btn btn-primary" onClick={handleSave}>{editUser ? '儲存變更' : '新增帳號'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">確認刪除帳號</span>
              <button className="modal-close" onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="alert alert-danger">
                確定要刪除帳號「<strong>{deleteConfirm.username}</strong>」（{deleteConfirm.name}）嗎？此操作無法還原。
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>取消</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>確認刪除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
