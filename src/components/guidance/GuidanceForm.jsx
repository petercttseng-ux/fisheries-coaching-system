import React, { useContext, useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../../contexts/AppContext.jsx'
import { personnel, counties, industries } from '../../data/personnel.js'
import { toast } from 'react-toastify'

const CHECKLIST_ITEMS = [
  { key: 'production', label: '生產技術指導' },
  { key: 'quality', label: '品質管理' },
  { key: 'marketing', label: '行銷輔導' },
  { key: 'regulation', label: '法規遵循' },
  { key: 'environment', label: '環境管理' },
]

const emptyForm = {
  date: new Date().toISOString().slice(0, 10),
  county: '', groupName: '', industry: '', product: '',
  friAttendees: [],
  groupAttendees: [{ name: '', role: '' }],
  summary: '',
  checklist: { production: false, quality: false, marketing: false, regulation: false, environment: false },
  status: 'draft',
  taskItems: [],
}

export default function GuidanceForm() {
  const { addRecord, updateRecord, guidanceRecords, currentUser, addTask } = useContext(AppContext)
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [newTask, setNewTask] = useState({ title: '', assignee: '', dueDate: '', priority: 'medium', description: '' })
  const [showTaskForm, setShowTaskForm] = useState(false)

  useEffect(() => {
    if (isEdit) {
      const rec = guidanceRecords.find(r => r.id === id)
      if (rec) {
        setForm({
          date: rec.date || '',
          county: rec.county || '',
          groupName: rec.groupName || '',
          industry: rec.industry || '',
          product: rec.product || '',
          friAttendees: rec.friAttendees || [],
          groupAttendees: rec.groupAttendees?.length ? rec.groupAttendees : [{ name: '', role: '' }],
          summary: rec.summary || '',
          checklist: rec.checklist || emptyForm.checklist,
          status: rec.status || 'draft',
          taskItems: [],
        })
      }
    }
  }, [isEdit, id, guidanceRecords])

  const validate = () => {
    const errs = {}
    if (!form.date) errs.date = '請選擇輔導日期'
    if (!form.county) errs.county = '請選擇縣市'
    if (!form.groupName.trim()) errs.groupName = '請輸入班組名稱'
    if (!form.industry) errs.industry = '請選擇產業類別'
    if (!form.product.trim()) errs.product = '請輸入主要產品'
    if (!form.summary.trim()) errs.summary = '請輸入輔導摘要'
    if (form.friAttendees.length === 0) errs.friAttendees = '請選擇至少一位水試所人員'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (status) => {
    if (!validate()) { toast.error('請填寫必填欄位'); return }
    const data = {
      ...form,
      status,
      createdBy: currentUser?.name,
      groupAttendees: form.groupAttendees.filter(g => g.name.trim()),
    }
    if (isEdit) {
      updateRecord(id, data)
      toast.success('輔導記錄已更新')
      navigate(`/guidance/${id}`)
    } else {
      const newId = addRecord(data)
      form.taskItems.forEach(t => {
        if (t.title.trim()) addTask({ ...t, guidanceId: newId })
      })
      toast.success('輔導記錄已新增')
      navigate(`/guidance/${newId}`)
    }
  }

  const toggleAttendee = (name) => {
    setForm(f => ({
      ...f,
      friAttendees: f.friAttendees.includes(name)
        ? f.friAttendees.filter(n => n !== name)
        : [...f.friAttendees, name]
    }))
  }

  const updateGroupAttendee = (idx, field, val) => {
    setForm(f => ({ ...f, groupAttendees: f.groupAttendees.map((g, i) => i === idx ? { ...g, [field]: val } : g) }))
  }

  const addGroupRow = () => setForm(f => ({ ...f, groupAttendees: [...f.groupAttendees, { name: '', role: '' }] }))
  const removeGroupRow = (idx) => setForm(f => ({ ...f, groupAttendees: f.groupAttendees.filter((_, i) => i !== idx) }))

  const addTaskItem = () => {
    if (!newTask.title.trim()) return
    setForm(f => ({ ...f, taskItems: [...f.taskItems, { ...newTask, status: 'pending', progress: 0 }] }))
    setNewTask({ title: '', assignee: '', dueDate: '', priority: 'medium', description: '' })
    setShowTaskForm(false)
    toast.success('任務已加入列表')
  }

  const depts = [...new Set(personnel.map(p => p.dept))].sort()

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-title">{isEdit ? '✏️ 編輯輔導記錄' : '➕ 新增輔導記錄'}</div>
          <div className="page-subtitle">{isEdit ? '修改現有輔導記錄' : '填寫本次輔導活動詳情'}</div>
        </div>
        <div className="page-header-right">
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>取消</button>
        </div>
      </div>

      {/* Section 1: Basic Info */}
      <div className="form-section">
        <div className="form-section-title">📌 基本資訊</div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label required">輔導日期</label>
            <input type="date" className="form-control" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            {errors.date && <div className="form-error">{errors.date}</div>}
          </div>
          <div className="form-group">
            <label className="form-label required">縣市</label>
            <select className="form-control" value={form.county} onChange={e => setForm(f => ({ ...f, county: e.target.value }))}>
              <option value="">請選擇縣市</option>
              {counties.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.county && <div className="form-error">{errors.county}</div>}
          </div>
          <div className="form-group">
            <label className="form-label required">產業類別</label>
            <select className="form-control" value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}>
              <option value="">請選擇產業類別</option>
              {industries.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
            {errors.industry && <div className="form-error">{errors.industry}</div>}
          </div>
        </div>
        <div className="form-row">
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label required">班組名稱</label>
            <input type="text" className="form-control" placeholder="例：基隆區漁會拖網產銷班第1班" value={form.groupName} onChange={e => setForm(f => ({ ...f, groupName: e.target.value }))} />
            {errors.groupName && <div className="form-error">{errors.groupName}</div>}
          </div>
          <div className="form-group">
            <label className="form-label required">主要產品</label>
            <input type="text" className="form-control" placeholder="例：拖網漁業、文蛤、白蝦" value={form.product} onChange={e => setForm(f => ({ ...f, product: e.target.value }))} />
            {errors.product && <div className="form-error">{errors.product}</div>}
          </div>
        </div>
      </div>

      {/* Section 2: FRI Attendees */}
      <div className="form-section">
        <div className="form-section-title">👨‍🔬 水試所出席人員</div>
        {errors.friAttendees && <div className="alert alert-danger" style={{ marginBottom: 12 }}>{errors.friAttendees}</div>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {form.friAttendees.map(name => (
            <span key={name} className="badge badge-cyan" style={{ fontSize: '0.85rem', padding: '5px 10px' }}>
              {name} <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 4, color: 'inherit' }} onClick={() => toggleAttendee(name)}>✕</button>
            </span>
          ))}
        </div>
        {depts.map(dept => (
          <div key={dept} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: 6 }}>{dept}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {personnel.filter(p => p.dept === dept).map(p => (
                <button
                  key={p.id}
                  type="button"
                  className={`btn btn-sm ${form.friAttendees.includes(p.name) ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => toggleAttendee(p.name)}
                  style={{ fontSize: '0.8rem' }}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Section 3: Group Attendees */}
      <div className="form-section">
        <div className="form-section-title">👥 產銷班出席人員</div>
        {form.groupAttendees.map((g, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'center' }}>
            <input
              type="text" className="form-control" placeholder="姓名" style={{ flex: 1 }}
              value={g.name} onChange={e => updateGroupAttendee(idx, 'name', e.target.value)}
            />
            <input
              type="text" className="form-control" placeholder="職稱/角色（如：班長、班員）" style={{ flex: 1 }}
              value={g.role} onChange={e => updateGroupAttendee(idx, 'role', e.target.value)}
            />
            <button type="button" className="btn btn-sm btn-danger btn-icon" onClick={() => removeGroupRow(idx)} disabled={form.groupAttendees.length === 1}>✕</button>
          </div>
        ))}
        <button type="button" className="btn btn-sm btn-outline" onClick={addGroupRow}>➕ 新增人員</button>
      </div>

      {/* Section 4: Summary */}
      <div className="form-section">
        <div className="form-section-title">📄 輔導摘要</div>
        <div className="form-group">
          <label className="form-label required">討論重點與輔導內容</label>
          <textarea
            className="form-control" rows={6}
            placeholder="請詳細描述本次輔導的主要內容、討論重點、發現問題及建議措施..."
            value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
          />
          {errors.summary && <div className="form-error">{errors.summary}</div>}
        </div>
      </div>

      {/* Section 5: Checklist */}
      <div className="form-section">
        <div className="form-section-title">☑️ 輔導項目清單</div>
        <ul className="checklist">
          {CHECKLIST_ITEMS.map(item => (
            <li key={item.key} className="checklist-item" onClick={() => setForm(f => ({ ...f, checklist: { ...f.checklist, [item.key]: !f.checklist[item.key] } }))}>
              <input type="checkbox" checked={form.checklist[item.key]} readOnly />
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Section 6: Tasks */}
      {!isEdit && (
        <div className="form-section">
          <div className="form-section-title">✅ 交辦事項</div>
          {form.taskItems.map((t, idx) => (
            <div key={idx} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 16px', marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>負責人：{t.assignee} · 截止：{t.dueDate}</div>
                </div>
                <button type="button" className="btn btn-sm btn-danger" onClick={() => setForm(f => ({ ...f, taskItems: f.taskItems.filter((_, i) => i !== idx) }))}>移除</button>
              </div>
            </div>
          ))}
          {showTaskForm ? (
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: 16 }}>
              <div className="form-row">
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">任務標題</label>
                  <input type="text" className="form-control" value={newTask.title} onChange={e => setNewTask(t => ({ ...t, title: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">負責人</label>
                  <select className="form-control" value={newTask.assignee} onChange={e => setNewTask(t => ({ ...t, assignee: e.target.value }))}>
                    <option value="">請選擇</option>
                    {personnel.map(p => <option key={p.id} value={p.name}>{p.name} ({p.dept})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">截止日期</label>
                  <input type="date" className="form-control" value={newTask.dueDate} onChange={e => setNewTask(t => ({ ...t, dueDate: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">優先程度</label>
                  <select className="form-control" value={newTask.priority} onChange={e => setNewTask(t => ({ ...t, priority: e.target.value }))}>
                    <option value="high">高</option>
                    <option value="medium">中</option>
                    <option value="low">低</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">任務說明</label>
                <textarea className="form-control" rows={2} value={newTask.description} onChange={e => setNewTask(t => ({ ...t, description: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="btn btn-primary btn-sm" onClick={addTaskItem}>確認加入</button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowTaskForm(false)}>取消</button>
              </div>
            </div>
          ) : (
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowTaskForm(true)}>➕ 新增交辦事項</button>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', padding: '16px 0' }}>
        <button type="button" className="btn btn-secondary btn-lg" onClick={() => navigate(-1)}>取消</button>
        <button type="button" className="btn btn-warning btn-lg" onClick={() => handleSubmit('draft')}>💾 儲存草稿</button>
        <button type="button" className="btn btn-primary btn-lg" onClick={() => handleSubmit('submitted')}>📤 提交記錄</button>
      </div>
    </div>
  )
}
