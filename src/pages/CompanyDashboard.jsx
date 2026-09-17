import React, { useEffect, useMemo, useState } from 'react'
import {
  Building2,
  Users,
  Inbox,
  CheckCircle2,
  Clock3,
  ChevronRight,
  ArrowLeft,
  CalendarDays,
  Check,
  X,
  UserPlus,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import Navbar from '../components/Navbar'
import { Card, Badge, Button } from '../components/ui'

export default function CompanyDashboard() {
  const {
    currentUser,
    getStudentsForCompany,
    getPendingDaySubmissionsForCompany,
    approveDay,
    getPendingCompanyRequestsForCompany,
    respondCompanyRequest,
  } = useApp()
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState([])
  const [pending, setPending] = useState([])
  const [requests, setRequests] = useState([])
  const [respondingId, setRespondingId] = useState(null)
  const [error, setError] = useState('')
  const [openStudent, setOpenStudent] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [fetchedStudents, fetchedPending, fetchedRequests] = await Promise.all([
        getStudentsForCompany(),
        getPendingDaySubmissionsForCompany(),
        getPendingCompanyRequestsForCompany(),
      ])
      setStudents(fetchedStudents)
      setPending(fetchedPending)
      setRequests(fetchedRequests)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove(studentId, monthId, weekId, dayId) {
    try {
      await approveDay(studentId, monthId, weekId, dayId)
      await loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleRespondRequest(requestId, accept) {
    setRespondingId(requestId)
    try {
      await respondCompanyRequest(requestId, accept)
      await loadData() // accepting moves a student from requests into the students list
    } catch (err) {
      setError(err.message)
    } finally {
      setRespondingId(null)
    }
  }

  const openRecord = useMemo(
    () => students.find((student) => student.studentId === openStudent),
    [students, openStudent]
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-50">
        <Navbar />
        <p className="text-center text-ink-500 mt-20">Loading your dashboard…</p>
      </div>
    )
  }

  if (openRecord) {
    return (
      <StudentRecord
        record={openRecord}
        onBack={() => setOpenStudent(null)}
        onApprove={(monthId, weekId, dayId) =>
          handleApprove(openRecord.studentId, monthId, weekId, dayId)
        }
      />
    )
  }

  return (
    <div className="min-h-screen bg-ink-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Building2 size={18} className="text-trust-600" />
            <Badge tone="trust">Company portal</Badge>
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">
            Company dashboard
          </h1>
          <p className="text-ink-500 text-sm mt-1">
            Review daily entries and approve only the students placed with your organisation.
          </p>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

        <section>
          <div className="flex items-center gap-2 mb-3">
            <UserPlus size={16} className="text-clay-600" />
            <h2 className="text-sm font-semibold text-ink-700 uppercase tracking-wide">
              Student requests {requests.length > 0 && `(${requests.length})`}
            </h2>
          </div>

          {requests.length === 0 ? (
            <Card className="p-5 text-sm text-ink-400">
              No students have requested to join your organisation yet.
            </Card>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <Card key={req._id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-ink-900 text-sm">
                        {req.profile?.fullname || req.studentId?.name || 'Unnamed student'}
                      </p>
                      <p className="text-xs text-ink-500 mt-0.5">
                        {req.profile?.department} · {req.profile?.level} · Matric: {req.profile?.matricnumber}
                      </p>
                      <p className="text-xs text-ink-400 mt-1">
                        Staff contact: {req.staffName} ({req.staffPhone})
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="danger"
                        className="!p-2"
                        disabled={respondingId === req._id}
                        onClick={() => handleRespondRequest(req._id, false)}
                        title="Decline"
                      >
                        <X size={16} />
                      </Button>
                      <Button
                        className="!p-2"
                        disabled={respondingId === req._id}
                        onClick={() => handleRespondRequest(req._id, true)}
                        title="Accept"
                      >
                        <Check size={16} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Inbox size={16} className="text-clay-600" />
            <h2 className="text-sm font-semibold text-ink-700 uppercase tracking-wide">
              Daily entries awaiting approval {pending.length > 0 && `(${pending.length})`}
            </h2>
          </div>

          {pending.length === 0 ? (
            <Card className="p-5">
              <div className="flex items-center gap-2 text-sm text-ink-400">
                <CheckCircle2 size={16} className="text-forest-500" />
                No daily entries are waiting for approval.
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {pending.map((item) => (
                <Card key={`${item.studentId}-${item.month._id}-${item.week._id}-${item.day._id}`} className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium text-ink-900 text-sm">{item.profile?.fullname}</p>
                      <p className="text-xs text-ink-500 mt-0.5">
                        {item.profile?.department} · {item.profile?.level}
                      </p>
                      <p className="text-xs text-ink-400 mt-2">
                        {item.month.label} · {item.week.label} · {item.day.label}
                      </p>
                      <p className="text-sm text-ink-700 mt-2">{item.day.text}</p>
                    </div>
                    <Button
                      onClick={() => handleApprove(item.studentId, item.month._id, item.week._id, item.day._id)}
                      className="flex items-center justify-center gap-2 shrink-0"
                    >
                      <CheckCircle2 size={15} /> Approve day
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Users size={16} className="text-forest-600" />
            <h2 className="text-sm font-semibold text-ink-700 uppercase tracking-wide">
              Students under your care ({students.length})
            </h2>
          </div>

          {students.length === 0 ? (
            <Card className="p-5 text-sm text-ink-400">
              No students are currently associated with {currentUser.name}.
            </Card>
          ) : (
            <div className="space-y-3">
              {students.map((student) => {
                const currentMonth = student.logbook?.months.find((m) => !m.locked)
                const days = currentMonth?.weeks.flatMap((w) => w.days) || []
                const approved = days.filter((d) => d.approved).length
                const pendingCount = days.filter((d) => d.submitted && !d.approved).length

                return (
                  <button
                    key={student.studentId}
                    onClick={() => setOpenStudent(student.studentId)}
                    className="w-full text-left"
                  >
                    <Card className="p-4 hover:border-forest-300 transition-colors">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium text-ink-900 text-sm">{student.profile?.fullname}</p>
                          <p className="text-xs text-ink-500 mt-0.5">
                            {student.profile?.matricnumber} · {student.profile?.department}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge tone={pendingCount ? 'clay' : 'forest'}>
                            {pendingCount ? `${pendingCount} awaiting` : `${approved}/${days.length} approved`}
                          </Badge>
                          <ChevronRight size={16} className="text-ink-300" />
                        </div>
                      </div>
                    </Card>
                  </button>
                )
              })}
            </div>
          )}
        </section>

        <Card className="p-5">
          <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-2">Organisation</p>
          <p className="text-sm font-medium text-ink-900">{currentUser.name}</p>
          <p className="text-xs text-ink-400 mt-1">
            Access is limited to student profiles whose IT placement organisation matches this company.
          </p>
        </Card>
      </div>
    </div>
  )
}

function StudentRecord({ record, onBack, onApprove }) {
  const { profile, logbook } = record

  return (
    <div className="min-h-screen bg-ink-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center gap-1.5 mb-6 !px-2"
        >
          <ArrowLeft size={15} /> Back to company dashboard
        </Button>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Building2 size={17} className="text-trust-600" />
            <span className="text-xs font-semibold text-trust-700 uppercase tracking-wide">Company record</span>
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">{profile?.fullname}</h1>
          <p className="text-ink-500 text-sm mt-1">
            {profile?.matricnumber} · {profile?.department} · {profile?.level}
          </p>
        </div>

        <div className="space-y-4">
          {logbook?.months.map((month) => (
            <Card key={month._id} className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CalendarDays size={16} className="text-ink-400" />
                  <p className="font-medium text-ink-900 text-sm">{month.label}</p>
                </div>
                {month.locked ? (
                  <Badge tone="ink">Month submitted</Badge>
                ) : (
                  <Badge tone="clay">Current</Badge>
                )}
              </div>

              <div className="space-y-5">
                {month.weeks.map((week) => (
                  <div key={week._id}>
                    <p className="text-xs font-semibold text-ink-500 mb-2">{week.label}</p>
                    <div className="space-y-2">
                      {week.days.map((day) => (
                        <div key={day._id} className="rounded-xl border border-ink-100 p-3">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold text-ink-500">{day.label}</span>
                                {day.approved ? (
                                  <Badge tone="forest"><CheckCircle2 size={11} className="mr-1" /> Approved</Badge>
                                ) : day.submitted ? (
                                  <Badge tone="clay"><Clock3 size={11} className="mr-1" /> Awaiting approval</Badge>
                                ) : (
                                  <Badge tone="ink">Not submitted</Badge>
                                )}
                              </div>
                              <p className="text-sm text-ink-700">
                                {day.text || <span className="text-ink-300">No entry</span>}
                              </p>
                            </div>

                            {day.submitted && !day.approved && !month.locked && (
                              <Button
                                onClick={() => onApprove(month._id, week._id, day._id)}
                                className="flex items-center justify-center gap-2 shrink-0"
                              >
                                <CheckCircle2 size={14} /> Approve
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}