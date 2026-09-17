import React, { createContext, useContext, useEffect, useState } from 'react'
import { apiRequest, getToken, setToken } from '../api/client'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  // On first load, if a token is saved, ask the backend who it belongs to.
  useEffect(() => {
    async function restoreSession() {
      const token = getToken()
      if (!token) {
        setAuthLoading(false)
        return
      }
      try {
        const user = await apiRequest('/auth/me')
        setCurrentUser(user)
      } catch {
        setToken(null) // token was invalid/expired
      } finally {
        setAuthLoading(false)
      }
    }
    restoreSession()
  }, [])

  // ---- Auth ----
  async function signup({ role, name, email, password, school, department, companyName }) {
    try {
      const payload = {
        role,
        // Company signup collects a separate "companyName" field in the form,
        // but the backend User model only has `name` — no companyName field.
        // So for a company account, `name` on the User IS the company name.
        name: role === 'company' ? companyName : name,
        email,
        password,
        school,
        department,
      }
      const res = await apiRequest('/auth/signup', { method: 'POST', body: payload })
      setToken(res.token)
      const user = { id: res.id, role: res.role, name: res.name, email: res.email, school: res.school, department: res.department }
      setCurrentUser(user)

      // If they're a student, fetch their profile now so the caller can decide
      // whether to route to onboarding or straight to the dashboard.
      let profile = null
      if (res.role === 'student') {
        profile = await getStudentProfile().catch(() => null)
      }

      return { ok: true, id: res.id, role: res.role, profile }
    } catch (error) {
      return { ok: false, error: error.message }
    }
  }

  async function login({ email, password }) {
    try {
      const res = await apiRequest('/auth/login', { method: 'POST', body: { email, password } })
      setToken(res.token)
      const user = { id: res.id, role: res.role, name: res.name, email: res.email, school: res.school, department: res.department }
      setCurrentUser(user)

      let profile = null
      if (res.role === 'student') {
        profile = await getStudentProfile().catch(() => null)
      }

      return { ok: true, id: res.id, role: res.role, profile }
    } catch (error) {
      return { ok: false, error: error.message }
    }
  }

  function logout() {
    setToken(null)
    setCurrentUser(null)
  }

  // ---- Student profile ----
  async function saveStudentProfile(profile) {
    return apiRequest('/student/profile', { method: 'POST', body: profile })
  }

  async function getStudentProfile() {
    try {
      return await apiRequest('/student/profile')
    } catch (error) {
      if (error.status === 404) return null
      throw error
    }
  }

  // ---- Join requests ----
  async function sendJoinRequest(supervisorId) {
    return apiRequest('/student/join-request', { method: 'POST', body: { supervisorId } })
  }

  async function respondJoinRequest(requestId, accept) {
    return apiRequest(`/supervisor/requests/${requestId}`, {
      method: 'PATCH',
      body: { decision: accept ? 'accepted' : 'declined' },
    })
  }

  async function getJoinRequestForStudent() {
    try {
      return await apiRequest('/student/join-request')
    } catch (error) {
      if (error.status === 404) return null
      throw error
    }
  }

  // Derived from the (now supervisorId-populated) join request — see the
  // backend fix needed in studentController.js for this to return a real name/email.
  async function getSupervisorForStudent() {
    const request = await getJoinRequestForStudent()
    if (!request || request.status !== 'accepted') return null
    return request.supervisorId // populated object: { _id, name, email }
  }

  async function getStudentsForSupervisor() {
    return apiRequest('/supervisor/students')
  }

  async function getPendingRequestsForSupervisor() {
    return apiRequest('/supervisor/requests/pending')
  }

  async function suggestSupervisors(school, department) {
    const params = new URLSearchParams()
    if (school) params.set('school', school)
    if (department) params.set('department', department)
    return apiRequest(`/supervisor/suggest?${params.toString()}`)
  }

  async function listCompanies() {
    return apiRequest('/company/list')
  }

  // ---- Company access ----
  async function getStudentsForCompany() {
    return apiRequest('/company/students')
  }

  async function getPendingDaySubmissionsForCompany() {
    return apiRequest('/company/submissions/pending')
  }

  async function approveDay(studentId, monthId, weekId, dayId) {
    return apiRequest(`/company/logbook/${studentId}/${monthId}/${weekId}/${dayId}/approve`, {
      method: 'PATCH',
    })
  }

  // ---- Logbook (student's own) ----
  async function getLogbook() {
    try {
      return await apiRequest('/student/logbook')
    } catch (error) {
      if (error.status === 404) return null
      throw error
    }
  }

  async function updateDayEntry(monthId, weekId, dayId, text) {
    return apiRequest(`/student/logbook/${monthId}/${weekId}/${dayId}`, {
      method: 'PATCH',
      body: { text },
    })
  }

  async function submitDay(monthId, weekId, dayId) {
    return apiRequest(`/student/logbook/${monthId}/${weekId}/${dayId}/submit`, { method: 'POST' })
  }

  async function submitMonth(monthId, secondPartyEmail) {
    return apiRequest(`/student/logbook/${monthId}/submit`, {
      method: 'POST',
      body: { secondPartyEmail },
    })
  }

  async function sendCompanyRequest(companyId, staffName, staffPhone) {
    return apiRequest('/student/company-request', { method: 'POST', body: { companyId, staffName, staffPhone } })
  }

  async function getCompanyRequestForStudent() {
    try {
      return await apiRequest('/student/company-request')
    } catch (error) {
      if (error.status === 404) return null
      throw error
    }
  }

  async function getPendingCompanyRequestsForCompany() {
    return apiRequest('/company/requests/pending')
  }

  async function respondCompanyRequest(requestId, accept) {
    return apiRequest(`/company/requests/${requestId}`, {
      method: 'PATCH',
      body: { decision: accept ? 'accepted' : 'declined' },
    })
  }

  async function deleteAccount() {
    await apiRequest('/auth/me', { method: 'DELETE' })
    setToken(null)
    setCurrentUser(null)
  }

  async function setWeekMark(studentId, monthId, weekId, mark) {
    return apiRequest(`/supervisor/students/${studentId}/logbook/${monthId}/${weekId}/mark`, {
      method: 'PATCH',
      body: { mark },
    })
  }

  const value = {
  currentUser,
  authLoading,
  signup,
  login,
  logout,
  saveStudentProfile,
  getStudentProfile,
  sendJoinRequest,
  respondJoinRequest,
  getJoinRequestForStudent,
  getSupervisorForStudent,
  getStudentsForSupervisor,
  getPendingRequestsForSupervisor,
  suggestSupervisors,
  listCompanies,
  getStudentsForCompany,
  getPendingDaySubmissionsForCompany,
  submitDay,
  approveDay,
  getLogbook,
  updateDayEntry,
  submitMonth,
  sendCompanyRequest,
  getCompanyRequestForStudent,
  getPendingCompanyRequestsForCompany,
  respondCompanyRequest,
  deleteAccount,
  setWeekMark
}

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}