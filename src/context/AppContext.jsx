import React, { createContext, useContext, useEffect, useState } from 'react'
import { loadState, saveState, getInitialState, uid, buildLogbook } from '../data/store'
import { SEED_SUPERVISORS, SEED_COMPANIES } from '../data/seed'

const AppContext = createContext(null)

const sameCompany = (a, b) =>
  String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase()

export function AppProvider({ children }) {
  const [state, setState] = useState(() => {
    const loaded = loadState()
    if (loaded) {
      return {
        ...loaded,
        companies: loaded.companies?.length ? loaded.companies : SEED_COMPANIES.map((c) => ({ ...c })),
      }
    }
    const init = getInitialState()
    init.supervisors = SEED_SUPERVISORS.map((s) => ({ ...s }))
    init.companies = SEED_COMPANIES.map((c) => ({ ...c }))
    return init
  })

  useEffect(() => { saveState(state) }, [state])

  // ---- Auth ----
  function signup({ role, name, email, password, school, department, companyName }) {
    const normalizedEmail = email.trim().toLowerCase()
    const existingUser = state.users.find((u) => u.email.toLowerCase() === normalizedEmail)
    const existingSupervisor = state.supervisors.find((s) => s.email.toLowerCase() === normalizedEmail)
    const existingCompany = state.companies.find((c) => c.email.toLowerCase() === normalizedEmail)
    if (existingUser || existingSupervisor || existingCompany) {
      return { ok: false, error: 'An account with this email already exists.' }
    }

    const id = uid(role === 'student' ? 'stu' : role === 'company' ? 'company' : 'sup')
    const user = { id, role, name, email: normalizedEmail, password }

    setState((s) => {
      const next = { ...s, users: [...s.users, user], currentUserId: id }
      if (role === 'supervisor') {
        next.supervisors = [...s.supervisors, { id, name, email: normalizedEmail, school, department, password }]
      }
      if (role === 'company') {
        next.companies = [...(s.companies || []), {
          id,
          name: companyName.trim(),
          email: normalizedEmail,
          password,
        }]
      }
      return next
    })
    return { ok: true, id }
  }

  function login({ role, email, password }) {
    const normalizedEmail = email.trim().toLowerCase()
    if (role === 'student') {
      const user = state.users.find((u) =>
        u.email.toLowerCase() === normalizedEmail && u.password === password && u.role === 'student'
      )
      if (!user) return { ok: false, error: 'No matching student account. Check your details or sign up.' }
      setState((s) => ({ ...s, currentUserId: user.id }))
      return { ok: true, id: user.id }
    }

    if (role === 'supervisor') {
      const seeded = state.supervisors.find((sv) => sv.email.toLowerCase() === normalizedEmail && sv.password === password)
      if (!seeded) return { ok: false, error: 'No matching university supervisor account. Check your details or sign up.' }
      setState((s) => ({ ...s, currentUserId: seeded.id }))
      return { ok: true, id: seeded.id }
    }

    const company = (state.companies || []).find((c) =>
      c.email.toLowerCase() === normalizedEmail && c.password === password
    )
    if (!company) return { ok: false, error: 'No matching company account. Check your details or sign up.' }
    setState((s) => ({ ...s, currentUserId: company.id }))
    return { ok: true, id: company.id }
  }

  function logout() {
    setState((s) => ({ ...s, currentUserId: null }))
  }

  const currentUser = (() => {
    if (!state.currentUserId) return null
    const company = (state.companies || []).find((x) => x.id === state.currentUserId)
    if (company) return { ...company, role: 'company' }
    const sup = state.supervisors.find((x) => x.id === state.currentUserId)
    if (sup) return { ...sup, role: 'supervisor' }
    const u = state.users.find((x) => x.id === state.currentUserId)
    return u || null
  })()

  // ---- Student profile ----
  function saveStudentProfile(userId, profile) {
    setState((s) => ({
      ...s,
      studentProfiles: {
        ...s.studentProfiles,
        [userId]: { ...(s.studentProfiles[userId] || {}), ...profile },
      },
    }))
  }

  function getStudentProfile(userId) {
    return state.studentProfiles[userId] || null
  }

  // ---- Join requests ----
  function sendJoinRequest(studentId, supervisorId) {
    setState((s) => {
      const already = s.joinRequests.find((r) => r.studentId === studentId && r.status !== 'declined')
      if (already) return s
      const req = { id: uid('req'), studentId, supervisorId, status: 'pending', createdAt: new Date().toISOString() }
      return { ...s, joinRequests: [...s.joinRequests, req] }
    })
  }

  function respondJoinRequest(requestId, accept) {
    setState((s) => {
      const joinRequests = s.joinRequests.map((r) =>
        r.id === requestId ? { ...r, status: accept ? 'accepted' : 'declined' } : r
      )
      let logbooks = s.logbooks
      if (accept) {
        const req = s.joinRequests.find((r) => r.id === requestId)
        if (req && !logbooks[req.studentId]) {
          logbooks = { ...logbooks, [req.studentId]: buildLogbook(4) }
        }
      }
      return { ...s, joinRequests, logbooks }
    })
  }

  function getJoinRequestForStudent(studentId) {
    return state.joinRequests.find((r) => r.studentId === studentId) || null
  }

  function getSupervisorForStudent(studentId) {
    const req = state.joinRequests.find((r) => r.studentId === studentId && r.status === 'accepted')
    if (!req) return null
    return state.supervisors.find((s) => s.id === req.supervisorId) || null
  }

  function getStudentsForSupervisor(supervisorId) {
    return state.joinRequests
      .filter((r) => r.supervisorId === supervisorId && r.status === 'accepted')
      .map((r) => ({
        studentId: r.studentId,
        profile: state.studentProfiles[r.studentId],
        logbook: state.logbooks[r.studentId],
      }))
  }

  function getPendingRequestsForSupervisor(supervisorId) {
    return state.joinRequests
      .filter((r) => r.supervisorId === supervisorId && r.status === 'pending')
      .map((r) => ({ ...r, profile: state.studentProfiles[r.studentId] }))
  }

  function suggestSupervisors(school, department) {
    return state.supervisors.filter((sv) => sv.school === school && sv.department === department)
  }

  // ---- Company access ----
  // A company can only retrieve profiles whose IT placement organisation matches
  // the company's registered organisation name.
  function getStudentsForCompany(companyId) {
    const company = (state.companies || []).find((c) => c.id === companyId)
    if (!company) return []
    return Object.entries(state.studentProfiles)
      .filter(([, profile]) =>
        profile.companyId ? profile.companyId === companyId : sameCompany(profile.orgName, company.name)
      )
      .map(([studentId, profile]) => ({
        studentId,
        profile,
        logbook: state.logbooks[studentId],
      }))
  }

  function getPendingDaySubmissionsForCompany(companyId) {
    return getStudentsForCompany(companyId).flatMap((student) => {
      const pending = []
      student.logbook?.months.forEach((month) => {
        month.weeks.forEach((week) => {
          week.days.forEach((day) => {
            if (day.submitted && !day.approved) {
              pending.push({ ...student, month, week, day })
            }
          })
        })
      })
      return pending
    })
  }

  function submitDay(studentId, monthId, weekId, dayId) {
    setState((s) => {
      const lb = s.logbooks[studentId]
      if (!lb) return s
      const months = lb.months.map((m) => {
        if (m.id !== monthId || m.locked) return m
        return {
          ...m,
          weeks: m.weeks.map((w) => {
            if (w.id !== weekId) return w
            return {
              ...w,
              days: w.days.map((d) =>
                d.id === dayId && d.filled && !d.approved
                  ? { ...d, submitted: true, submittedAt: new Date().toISOString() }
                  : d
              ),
            }
          }),
        }
      })
      return { ...s, logbooks: { ...s.logbooks, [studentId]: { ...lb, months } } }
    })
  }

  function approveDay(companyId, studentId, monthId, weekId, dayId) {
    setState((s) => {
      const company = (s.companies || []).find((c) => c.id === companyId)
      const profile = s.studentProfiles[studentId]
      if (!company || !profile || !sameCompany(profile.orgName, company.name)) return s

      const lb = s.logbooks[studentId]
      if (!lb) return s

      const months = lb.months.map((m) => {
        if (m.id !== monthId || m.locked) return m
        return {
          ...m,
          weeks: m.weeks.map((w) => {
            if (w.id !== weekId) return w
            const days = w.days.map((d) =>
              d.id === dayId && d.submitted && !d.approved
                ? {
                    ...d,
                    approved: true,
                    approvedAt: new Date().toISOString(),
                    approvedBy: companyId,
                  }
                : d
            )
            const weekDone = days.length > 0 && days.every((d) => d.approved)
            return { ...w, days, weekDone }
          }),
        }
      })
      return { ...s, logbooks: { ...s.logbooks, [studentId]: { ...lb, months } } }
    })
  }

  // ---- Logbook ----
  function getLogbook(studentId) {
    return state.logbooks[studentId] || null
  }

  function updateDayEntry(studentId, monthId, weekId, dayId, text) {
    setState((s) => {
      const lb = s.logbooks[studentId]
      if (!lb) return s
      const months = lb.months.map((m) => {
        if (m.id !== monthId || m.locked) return m
        const weeks = m.weeks.map((w) => {
          if (w.id !== weekId) return w
          const days = w.days.map((d) =>
            d.id === dayId && !d.submitted && !d.approved
              ? { ...d, text, filled: text.trim().length > 0 }
              : d
          )
          return { ...w, days }
        })
        return { ...m, weeks }
      })
      return { ...s, logbooks: { ...s.logbooks, [studentId]: { ...lb, months } } }
    })
  }

  function markWeekDone(studentId, monthId, weekId) {
    // Kept for backwards compatibility with older UI/state.
    setState((s) => {
      const lb = s.logbooks[studentId]
      if (!lb) return s
      const months = lb.months.map((m) => {
        if (m.id !== monthId || m.locked) return m
        const weeks = m.weeks.map((w) => {
          if (w.id !== weekId) return w
          const allApproved = w.days.length > 0 && w.days.every((d) => d.approved)
          return allApproved ? { ...w, weekDone: true } : w
        })
        return { ...m, weeks }
      })
      return { ...s, logbooks: { ...s.logbooks, [studentId]: { ...lb, months } } }
    })
  }

  function submitMonth(studentId, monthId, secondPartyEmail) {
    setState((s) => {
      const lb = s.logbooks[studentId]
      if (!lb) return s
      const target = lb.months.find((m) => m.id === monthId)
      const ready = target?.weeks.every((w) => w.days.length > 0 && w.days.every((d) => d.approved))
      if (!ready) return s
      const months = lb.months.map((m) =>
        m.id === monthId
          ? {
              ...m,
              submitted: true,
              locked: true,
              secondPartyEmail: secondPartyEmail || null,
              submittedAt: new Date().toISOString(),
            }
          : m
      )
      return { ...s, logbooks: { ...s.logbooks, [studentId]: { ...lb, months } } }
    })
  }

  const value = {
    state,
    currentUser,
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
    getStudentsForCompany,
    getPendingDaySubmissionsForCompany,
    submitDay,
    approveDay,
    getLogbook,
    updateDayEntry,
    markWeekDone,
    submitMonth,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
