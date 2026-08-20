import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, Lock, Send, CheckCircle2, Building2, Clock3 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import Navbar from '../components/Navbar'
import { Button, Card, Badge, Field, Input, Textarea, ProgressBar } from '../components/ui'

export default function StudentDashboard() {
  const {
    currentUser,
    getStudentProfile,
    getSupervisorForStudent,
    getLogbook,
    updateDayEntry,
    submitDay,
    submitMonth,
  } = useApp()
  const navigate = useNavigate()
  const profile = getStudentProfile(currentUser.id)
  const supervisor = getSupervisorForStudent(currentUser.id)
  const logbook = getLogbook(currentUser.id)
  const [secondEmail, setSecondEmail] = useState('')
  const [submitMsg, setSubmitMsg] = useState('')

  if (!profile) { navigate('/onboarding'); return null }
  if (!supervisor) { navigate('/match'); return null }

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
  const allDaysApproved = approvedDays === totalDays

  function handleSubmitMonth() {
    submitMonth(currentUser.id, currentMonth.id, secondEmail.trim() || null)
    setSubmitMsg('Monthly report submitted.')
    setSecondEmail('')
  }

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
              key={week.id}
              week={week}
              onChangeDay={(dayId, text) => updateDayEntry(currentUser.id, currentMonth.id, week.id, dayId, text)}
              onSubmitDay={(dayId) => submitDay(currentUser.id, currentMonth.id, week.id, dayId)}
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
            <Button className="mt-4 flex items-center gap-2" onClick={handleSubmitMonth} disabled={!allDaysApproved}>
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
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div><dt className="text-ink-400 text-xs">Organisation</dt><dd className="text-ink-800">{profile.orgName}</dd></div>
            <div><dt className="text-ink-400 text-xs">Staff contact</dt><dd className="text-ink-800">{profile.staffName} · {profile.staffPhone}</dd></div>
          </dl>
        </Card>

        {history.length > 0 && (
          <Card className="p-5">
            <p className="text-sm font-semibold text-ink-800 mb-3">Submitted months</p>
            <div className="space-y-2">
              {history.map((m) => (
                <div key={m.id} className="flex items-center justify-between py-2 border-b border-ink-50 last:border-0">
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

function WeekCard({ week, onChangeDay, onSubmitDay, locked }) {
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
          {week.days.map((day) => {
            const status = day.approved ? 'approved' : day.submitted ? 'pending' : day.filled ? 'ready' : 'empty'
            return (
              <div key={day.id} className="border-b border-ink-100 last:border-0 pb-4 last:pb-0">
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <p className="text-xs font-medium text-ink-500">{day.label}</p>
                  {status === 'approved' && <Badge tone="forest"><CheckCircle2 size={11} className="mr-1" /> Approved</Badge>}
                  {status === 'pending' && <Badge tone="clay"><Clock3 size={11} className="mr-1" /> Awaiting approval</Badge>}
                  {status === 'ready' && <Badge tone="trust">Ready to send</Badge>}
                </div>
                <Textarea
                  rows={2}
                  value={day.text}
                  disabled={locked || day.submitted || day.approved}
                  onChange={(e) => onChangeDay(day.id, e.target.value)}
                  placeholder="What did you work on today?"
                />
                {!locked && !day.submitted && !day.approved && (
                  <Button
                    variant="secondary"
                    onClick={() => onSubmitDay(day.id)}
                    disabled={!day.filled}
                    className="mt-2 flex items-center gap-2"
                  >
                    <Send size={14} /> Send to company supervisor
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
