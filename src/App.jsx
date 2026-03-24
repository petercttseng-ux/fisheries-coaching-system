import React, { useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppContext } from './contexts/AppContext.jsx'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import Login from './components/auth/Login.jsx'
import Header from './components/common/Header.jsx'
import Sidebar from './components/common/Sidebar.jsx'
import Dashboard from './components/dashboard/Dashboard.jsx'
import GuidanceList from './components/guidance/GuidanceList.jsx'
import GuidanceForm from './components/guidance/GuidanceForm.jsx'
import GuidanceDetail from './components/guidance/GuidanceDetail.jsx'
import TaskList from './components/tasks/TaskList.jsx'
import TaskDetail from './components/tasks/TaskDetail.jsx'
import UserManager from './components/users/UserManager.jsx'
import MapView from './components/map/MapView.jsx'
import Reports from './components/reports/Reports.jsx'

function ProtectedRoute({ children, adminOnly = false }) {
  const { currentUser } = useContext(AppContext)
  if (!currentUser) return <Navigate to="/" replace />
  if (adminOnly && currentUser.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="page-content">{children}</div>
      </div>
    </div>
  )
}

export default function App() {
  const { currentUser } = useContext(AppContext)

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <Routes>
        <Route path="/" element={currentUser ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
        <Route path="/guidance" element={<ProtectedRoute><AppLayout><GuidanceList /></AppLayout></ProtectedRoute>} />
        <Route path="/guidance/new" element={<ProtectedRoute><AppLayout><GuidanceForm /></AppLayout></ProtectedRoute>} />
        <Route path="/guidance/edit/:id" element={<ProtectedRoute><AppLayout><GuidanceForm /></AppLayout></ProtectedRoute>} />
        <Route path="/guidance/:id" element={<ProtectedRoute><AppLayout><GuidanceDetail /></AppLayout></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><AppLayout><TaskList /></AppLayout></ProtectedRoute>} />
        <Route path="/tasks/:id" element={<ProtectedRoute><AppLayout><TaskDetail /></AppLayout></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute adminOnly><AppLayout><UserManager /></AppLayout></ProtectedRoute>} />
        <Route path="/map" element={<ProtectedRoute><AppLayout><MapView /></AppLayout></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><AppLayout><Reports /></AppLayout></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
