import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { CalendarDays, Lock, Send, CheckCircle2, Building2, Clock3 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import Navbar from '../components/Navbar'
import { Button, Card, Badge, Field, Input, Textarea, ProgressBar } from '../components/ui'

export default function StudentDashboard() {
  const {
    getStudentProfile,
    getSupervisorForStudent,
    getLogbook,
    updateDayEntry,
    submitDay,
    submitMonth,
  } = useApp()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [supervisor, setSupervisor] = useState(null)
  const [logbook, setLogbook] = useState(null)
  const [secondEmail, setSecondEmail] = useState('')
  const [submitMsg, setSubmitMsg] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [fetchedProfile, fetchedSupervisor] = await Promise.all([
        getStudentProfile(),
        getSupervisorForStudent(),
      ])

      if (!fetchedProfile) { navigate('/onboarding'); return }
      if (!fetchedSupervisor) { navigate('/match'); return }

      setProfile(fetchedProfile)
      setSupervisor(fetchedSupervisor)

      const fetchedLogbook = await getLogbook()
      setLogbook(fetchedLogbook)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function refreshLogbook() {
    const fresh = await getLogbook()
    setLogbook(fresh)
  }

  async function handleSaveDay(monthId, weekId, dayId, text) {
    try {
      await updateDayEntry(monthId, weekId, dayId, text)
      await refreshLogbook()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleSubmitDay(monthId, weekId, dayId) {
    try {
      await submitDay(monthId, weekId, dayId)
      await refreshLogbook()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleSubmitMonth() {
    try {
      await submitMonth(currentMonth._id, secondEmail.trim() || null)
      setSubmitMsg('Monthly report submitted.')
      setSecondEmail('')
      await refreshLogbook()
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-50">
        <Navbar />
        <p className="text-center text-ink-500 mt-20">Loading your dashboard…</p>
      </div>
    )
  }

  if (!logbook) {
    return (
      <div className="min-h-screen bg-ink-50">
        <Navbar />
        <p className="text-center text-ink-500 mt-20">Setting up your logbook…</p>
      </div>
    )
  }

  const currentMonth = logbook.months.find((m) => !m.locked) || logbook.months[logbook.months.length - 1]
  const history = logbook.months.filter((m) => m.locked)

  const totalDays = currentMonth.weeks.reduce((acc, w) => acc + w.days.length, 0)
  const approvedDays = currentMonth.weeks.reduce((acc, w) => acc + w.days.filter((d) => d.approved).length, 0)
  const pendingDays = currentMonth.weeks.reduce((acc, w) => acc + w.days.filter((d) => d.submitted && !d.approved).length, 0)
  const allDaysApproved = totalDays > 0 && approvedDays === totalDays

  return (
    <div className="min-h-screen bg-ink-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink-900">{currentMonth.label}</h1>
            <p className="text-ink-500 text-sm mt-0.5">
              University supervisor: <span className="font-medium text-ink-700">{supervisor.name}</span>
            </p>
          </div>
          <Badge tone={pendingDays ? 'clay' : 'forest'}>
            {approvedDays}/{totalDays} days approved
          </Badge>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-ink-700">Company approval progress</p>
            <p className="text-sm text-ink-500">{approvedDays}/{totalDays} days</p>
          </div>
          <ProgressBar done={approvedDays} total={totalDays} />
          {pendingDays > 0 && (
            <p className="text-xs text-clay-700 mt-2 flex items-center gap-1.5">
              <Clock3 size={13} /> {pendingDays} day{pendingDays === 1 ? '' : 's'} waiting for your company supervisor.
            </p>
          )}
        </Card>

        <div className="space-y-5">
          {currentMonth.weeks.map((week) => (
            <WeekCard
              key={week._id}
              week={week}
              onSaveDay={(dayId, text) => handleSaveDay(currentMonth._id, week._id, dayId, text)}
              onSubmitDay={(dayId) => handleSubmitDay(currentMonth._id, week._id, dayId)}
              locked={currentMonth.locked}
            />
          ))}
        </div>

        {!currentMonth.locked && (
          <Card className="p-5">
            <p className="text-sm font-semibold text-ink-800 mb-1">Submit monthly report</p>
            <p className="text-xs text-ink-500 mb-4">
              {allDaysApproved
                ? 'Every day has been approved by your company supervisor — you can submit the month.'
                : 'Complete each day, send it to your company supervisor, and wait for approval before submitting the month.'}
            </p>
            <Field label="Copy a second party (optional)">
              <Input
                type="email"
                placeholder="e.g. hr@yourplacement.com"
                value={secondEmail}
                onChange={(e) => setSecondEmail(e.target.value)}
              />
            </Field>
            <Button variant="accent" className="mt-4 flex items-center gap-2" onClick={handleSubmitMonth} disabled={!allDaysApproved}>
              <Send size={15} /> Submit to {supervisor.name.split(' ')[0]}
            </Button>
            {submitMsg && (
              <p className="text-sm text-forest-700 bg-forest-50 px-3 py-2 rounded-lg mt-3 flex items-center gap-2">
                <CheckCircle2 size={15} /> {submitMsg}
              </p>
            )}
          </Card>
        )}

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Building2 size={16} className="text-trust-600" />
            <p className="text-sm font-semibold text-ink-800">IT placement details</p>
          </div>
          {profile.companyId ? (
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div><dt className="text-ink-400 text-xs">Organisation</dt><dd className="text-ink-800">{profile.companyName}</dd></div>
              <div><dt className="text-ink-400 text-xs">Staff contact</dt><dd className="text-ink-800">{profile.staffName} · {profile.staffPhone}</dd></div>
            </dl>
          ) : (
            <div className="text-sm">
              <p className="text-ink-500 mb-3">You're not connected to a company yet.</p>
              <Link to="/company-match" className="inline-block px-4 py-2.5 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-medium text-sm">
                Find your company
              </Link>
            </div>
          )}
        </Card>

        {history.length > 0 && (
          <Card className="p-5">
            <p className="text-sm font-semibold text-ink-800 mb-3">Submitted months</p>
            <div className="space-y-2">
              {history.map((m) => (
                <div key={m._id} className="flex items-center justify-between py-2 border-b border-ink-50 last:border-0">
                  <span className="text-sm text-ink-700">{m.label}</span>
                  <span className="flex items-center gap-1.5 text-xs text-ink-400"><Lock size={12} /> Locked</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

function WeekCard({ week, onSaveDay, onSubmitDay, locked }) {
  const [open, setOpen] = useState(!week.weekDone)
  const approvedCount = week.days.filter((d) => d.approved).length

  return (
    <Card className="p-5">
      <button className="w-full flex items-center justify-between" onClick={() => setOpen((o) => !o)}>
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-ink-400" />
          <span className="font-medium text-ink-900 text-sm">{week.label}</span>
        </div>
        {week.weekDone
          ? <Badge tone="forest">Approved</Badge>
          : <Badge tone="ink">{approvedCount}/{week.days.length} approved</Badge>}
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          {week.days.map((day) => (
            <DayEntry
              key={day._id}
              day={day}
              locked={locked}
              onSave={(text) => onSaveDay(day._id, text)}
              onSubmit={() => onSubmitDay(day._id)}
            />
          ))}
        </div>
      )}
    </Card>
  )
}

function DayEntry({ day, locked, onSave, onSubmit }) {
  const [text, setText] = useState(day.text || '')
  const status = day.approved ? 'approved' : day.submitted ? 'pending' : day.filled ? 'ready' : 'empty'
  const disabled = locked || day.submitted || day.approved

  function handleBlur() {
    if (!disabled && text !== day.text) {
      onSave(text)
    }
  }

  return (
    <div className="border-b border-ink-100 last:border-0 pb-4 last:pb-0">
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <p className="text-xs font-medium text-ink-500">{day.label}</p>
        {status === 'approved' && <Badge tone="forest"><CheckCircle2 size={11} className="mr-1" /> Approved</Badge>}
        {status === 'pending' && <Badge tone="clay"><Clock3 size={11} className="mr-1" /> Awaiting approval</Badge>}
        {status === 'ready' && <Badge tone="trust">Ready to send</Badge>}
      </div>
      <Textarea
        rows={2}
        value={text}
        disabled={disabled}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        placeholder="What did you work on today?"
      />
      {!disabled && (
        <Button
          variant="secondary"
          onClick={() => { handleBlur(); onSubmit() }}
          disabled={!text.trim()}
          className="mt-2 flex items-center gap-2"
        >
          <Send size={14} /> Send to company supervisor
        </Button>
      )}
    </div>
  )
}