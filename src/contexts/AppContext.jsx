import React, { createContext, useState, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { personnel } from '../data/personnel.js'

export const AppContext = createContext(null)

const LS_KEY = 'fri_coaching_'

function loadLS(key, def) {
  try {
    const v = localStorage.getItem(LS_KEY + key)
    return v ? JSON.parse(v) : def
  } catch { return def }
}

function saveLS(key, val) {
  try { localStorage.setItem(LS_KEY + key, JSON.stringify(val)) } catch {}
}

const INIT_USERS = [
  { id: 'u1', username: 'admin', password: 'admin123', role: 'admin', name: '系統管理員', dept: '資訊室', active: true, createdAt: '2024-01-01' },
  { id: 'u2', username: 'manager1', password: 'mgr123', role: 'manager', name: '張所長', dept: '所長室', active: true, createdAt: '2024-01-01' },
  { id: 'u3', username: '柯慧玲', password: 'fri2024', role: 'researcher', name: '柯慧玲', dept: '技術服務組', active: true, createdAt: '2024-01-01' },
  { id: 'u4', username: '宋嘉軒', password: 'fri2024', role: 'researcher', name: '宋嘉軒', dept: '技術服務組', active: true, createdAt: '2024-01-01' },
  { id: 'u5', username: '林芳安', password: 'fri2024', role: 'researcher', name: '林芳安', dept: '水產加工組', active: true, createdAt: '2024-01-01' },
  { id: 'u6', username: '吳依玲', password: 'fri2024', role: 'researcher', name: '吳依玲', dept: '水產加工組', active: true, createdAt: '2024-01-01' },
  { id: 'u7', username: '陳均龍', password: 'fri2024', role: 'researcher', name: '陳均龍', dept: '海洋漁業組', active: true, createdAt: '2024-01-01' },
]

const INIT_GUIDANCE = [
  {
    id: 'g1',
    recordNo: 'FRI-2024-001',
    date: '2024-03-15',
    county: '基隆市',
    groupName: '基隆區漁會',
    industry: '海洋漁業',
    product: '拖網漁業',
    friAttendees: ['柯慧玲', '宋嘉軒'],
    groupAttendees: [
      { name: '王大明', role: '班長' },
      { name: '李小華', role: '班員' },
      { name: '陳志強', role: '班員' },
    ],
    summary: '本次輔導主要討論拖網漁業作業規範及漁獲品質提升。與班員分享最新的漁獲保鮮技術及市場行情分析，並針對現行作業方式提出改善建議。班員反映漁獲量近期有所下滑，建議調整作業漁場及作業時間。',
    checklist: { production: true, quality: true, marketing: false, regulation: true, environment: false },
    status: 'reviewed',
    createdBy: '柯慧玲',
    createdAt: '2024-03-15',
    updatedAt: '2024-03-16',
    tasks: ['t1', 't2'],
    comments: [
      { id: 'c1', author: '張所長', role: 'manager', text: '輔導工作做得相當完整，請繼續追蹤後續改善成效。', date: '2024-03-17' }
    ],
    attachments: []
  },
  {
    id: 'g2',
    recordNo: 'FRI-2024-002',
    date: '2024-04-08',
    county: '彰化縣',
    groupName: '彰化縣芳苑鄉水產養殖產銷班第5班',
    industry: '水產養殖',
    product: '文蛤、虱目魚、白蝦',
    friAttendees: ['黃瀛生', '陳念慈'],
    groupAttendees: [
      { name: '張美鳳', role: '班長' },
      { name: '黃建國', role: '副班長' },
      { name: '林秀蘭', role: '班員' },
      { name: '吳志偉', role: '班員' },
    ],
    summary: '本次輔導針對文蛤及虱目魚混養技術進行深度討論。說明混養密度調整方式與水質管理要點。班員反映白蝦死亡率偏高，現場勘查後判斷可能為水溫變化及溶氧不足所致，建議安裝增氧設備並調整換水頻率。',
    checklist: { production: true, quality: true, marketing: true, regulation: false, environment: true },
    status: 'submitted',
    createdBy: '黃瀛生',
    createdAt: '2024-04-08',
    updatedAt: '2024-04-08',
    tasks: ['t3'],
    comments: [],
    attachments: []
  },
  {
    id: 'g3',
    recordNo: 'FRI-2024-003',
    date: '2024-05-20',
    county: '澎湖縣',
    groupName: '赤崁丁香魚產銷班',
    industry: '海洋漁業',
    product: '丁香魚',
    friAttendees: ['鄭力綺'],
    groupAttendees: [
      { name: '陳明輝', role: '班長' },
      { name: '許志豪', role: '班員' },
    ],
    summary: '本次輔導重點在丁香魚產銷班的品牌建立與行銷策略。介紹農產品產銷履歷制度的申請流程，並討論如何透過電商平台拓展銷售通路。班員對於建立自有品牌有高度興趣，將協助規劃後續輔導課程。',
    checklist: { production: false, quality: true, marketing: true, regulation: true, environment: false },
    status: 'draft',
    createdBy: '鄭力綺',
    createdAt: '2024-05-20',
    updatedAt: '2024-05-20',
    tasks: [],
    comments: [],
    attachments: []
  },
]

const INIT_TASKS = [
  {
    id: 't1',
    taskNo: 'TSK-2024-001',
    title: '輔導基隆區漁會拖網漁業改善作業規範',
    description: '依據輔導記錄FRI-2024-001，協助業者修訂並落實作業規範，包含漁具規格、作業區域及安全規定。',
    guidanceId: 'g1',
    assignee: '柯慧玲',
    dueDate: '2024-04-30',
    priority: 'high',
    status: 'completed',
    progress: 100,
    createdAt: '2024-03-15',
    updatedAt: '2024-04-25',
    updates: [
      { id: 'up1', date: '2024-03-20', author: '柯慧玲', note: '已完成規範草案撰寫，送請業者確認。', progress: 40 },
      { id: 'up2', date: '2024-04-10', author: '柯慧玲', note: '業者確認規範內容，正式公告施行。', progress: 80 },
      { id: 'up3', date: '2024-04-25', author: '柯慧玲', note: '完成規範實施追蹤，業者反映執行良好。', progress: 100 },
    ]
  },
  {
    id: 't2',
    taskNo: 'TSK-2024-002',
    title: '安排漁獲保鮮技術講習會',
    description: '規劃辦理漁獲保鮮技術講習，邀請相關研究人員分享最新技術，提升基隆區漁業從業人員技能。',
    guidanceId: 'g1',
    assignee: '宋嘉軒',
    dueDate: '2024-06-15',
    priority: 'medium',
    status: 'inprogress',
    progress: 55,
    createdAt: '2024-03-15',
    updatedAt: '2024-05-01',
    updates: [
      { id: 'up4', date: '2024-04-01', author: '宋嘉軒', note: '場地規劃及講師邀請進行中。', progress: 30 },
      { id: 'up5', date: '2024-05-01', author: '宋嘉軒', note: '完成課程規劃，開放報名中。', progress: 55 },
    ]
  },
  {
    id: 't3',
    taskNo: 'TSK-2024-003',
    title: '彰化芳苑班白蝦死亡率改善追蹤',
    description: '針對白蝦死亡率偏高問題，提供水質管理及增氧設備安裝技術支援，並定期追蹤改善情況。',
    guidanceId: 'g2',
    assignee: '黃瀛生',
    dueDate: '2024-07-31',
    priority: 'high',
    status: 'pending',
    progress: 10,
    createdAt: '2024-04-08',
    updatedAt: '2024-04-08',
    updates: [
      { id: 'up6', date: '2024-04-08', author: '黃瀛生', note: '已建立追蹤機制，等待業者安裝增氧設備後進行現場評估。', progress: 10 },
    ]
  },
]

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => loadLS('currentUser', null))
  const [users, setUsers] = useState(() => loadLS('users', INIT_USERS))
  const [guidanceRecords, setGuidanceRecords] = useState(() => loadLS('guidance', INIT_GUIDANCE))
  const [tasks, setTasks] = useState(() => loadLS('tasks', INIT_TASKS))

  useEffect(() => { saveLS('currentUser', currentUser) }, [currentUser])
  useEffect(() => { saveLS('users', users) }, [users])
  useEffect(() => { saveLS('guidance', guidanceRecords) }, [guidanceRecords])
  useEffect(() => { saveLS('tasks', tasks) }, [tasks])

  const generateId = () => uuidv4().slice(0, 8)

  const login = useCallback((username, password) => {
    const user = users.find(u => u.username === username && u.password === password && u.active)
    if (user) {
      const { password: _, ...safe } = user
      setCurrentUser(safe)
      return { success: true, user: safe }
    }
    return { success: false, error: '帳號或密碼錯誤' }
  }, [users])

  const logout = useCallback(() => {
    setCurrentUser(null)
  }, [])

  const addRecord = useCallback((data) => {
    const count = guidanceRecords.length + 1
    const id = 'g' + generateId()
    const record = {
      ...data,
      id,
      recordNo: `FRI-${new Date().getFullYear()}-${String(count).padStart(3, '0')}`,
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
      comments: [],
      attachments: data.attachments || [],
      tasks: [],
    }
    setGuidanceRecords(prev => [record, ...prev])
    return id
  }, [guidanceRecords])

  const updateRecord = useCallback((id, data) => {
    setGuidanceRecords(prev => prev.map(r => r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString().slice(0, 10) } : r))
  }, [])

  const deleteRecord = useCallback((id) => {
    setGuidanceRecords(prev => prev.filter(r => r.id !== id))
  }, [])

  const addTask = useCallback((data) => {
    const count = tasks.length + 1
    const id = 't' + generateId()
    const task = {
      ...data,
      id,
      taskNo: `TSK-${new Date().getFullYear()}-${String(count).padStart(3, '0')}`,
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
      updates: [],
    }
    setTasks(prev => [task, ...prev])
    if (data.guidanceId) {
      setGuidanceRecords(prev => prev.map(r =>
        r.id === data.guidanceId ? { ...r, tasks: [...(r.tasks || []), id] } : r
      ))
    }
    return id
  }, [tasks])

  const updateTask = useCallback((id, data) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString().slice(0, 10) } : t))
  }, [])

  const addProgressUpdate = useCallback((taskId, update) => {
    const upId = 'up' + generateId()
    const entry = { id: upId, ...update, date: new Date().toISOString().slice(0, 10) }
    setTasks(prev => prev.map(t =>
      t.id === taskId
        ? { ...t, updates: [...(t.updates || []), entry], progress: update.progress ?? t.progress, status: update.status ?? t.status, updatedAt: new Date().toISOString().slice(0, 10) }
        : t
    ))
  }, [])

  const addComment = useCallback((recordId, comment) => {
    const cId = 'c' + generateId()
    const entry = { id: cId, ...comment, date: new Date().toISOString().slice(0, 10) }
    setGuidanceRecords(prev => prev.map(r =>
      r.id === recordId ? { ...r, comments: [...(r.comments || []), entry] } : r
    ))
  }, [])

  const addUser = useCallback((data) => {
    const id = 'u' + generateId()
    const user = { ...data, id, active: true, createdAt: new Date().toISOString().slice(0, 10) }
    setUsers(prev => [...prev, user])
    return id
  }, [])

  const updateUser = useCallback((id, data) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u))
  }, [])

  const deleteUser = useCallback((id) => {
    setUsers(prev => prev.filter(u => u.id !== id))
  }, [])

  const getPersonnelByName = useCallback((name) => {
    return personnel.find(p => p.name === name)
  }, [])

  const value = {
    currentUser,
    users,
    guidanceRecords,
    tasks,
    personnel,
    login,
    logout,
    addRecord,
    updateRecord,
    deleteRecord,
    addTask,
    updateTask,
    addProgressUpdate,
    addComment,
    addUser,
    updateUser,
    deleteUser,
    getPersonnelByName,
    generateId,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
