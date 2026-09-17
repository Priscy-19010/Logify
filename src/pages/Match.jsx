import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Clock } from 'lucide-react'
import { useApp } from '../context/AppContext'
import Navbar from '../components/Navbar'
import { Button, Card } from '../components/ui'

export default function Match() {
  const { getStudentProfile, suggestSupervisors, sendJoinRequest, getJoinRequestForStudent } = useApp()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [request, setRequest] = useState(null)
  const [suggested, setSuggested] = useState([])
  const [others, setOthers] = useState([])
  const [sendingId, setSendingId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [profile, fetchedRequest] = await Promise.all([
        getStudentProfile(),
        getJoinRequestForStudent(),
      ])

      if (!profile) {
        navigate('/onboarding')
        return
      }
      if (fetchedRequest?.status === 'accepted') {
        navigate('/student')
        return
      }

      setRequest(fetchedRequest)

      const [suggestedList, allList] = await Promise.all([
        suggestSupervisors(profile.school, profile.department),
        suggestSupervisors(),
      ])
      setSuggested(suggestedList)
      setOthers(allList.filter((s) => !suggestedList.find((sg) => sg._id === s._id)))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSend(supervisorId) {
    setSendingId(supervisorId)
    setError('')
    try {
      await sendJoinRequest(supervisorId)
      const updated = await getJoinRequestForStudent() // re-fetch so supervisorId comes back populated
      setRequest(updated)
    } catch (err) {
      setError(err.message)
    } finally {
      setSendingId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
          <p className="text-ink-500 text-sm">Loading supervisors…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="font-display text-2xl font-semibold text-ink-900">Find your supervisor</h1>
        <p className="text-ink-500 text-sm mt-1 mb-6">
          Choose from suggested matches based on your school and department, or browse everyone.
        </p>

        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-6">{error}</p>}

        {request && (
          <Card className="p-4 mb-6 flex items-center gap-3 border-clay-200 bg-clay-50/60">
            <Clock size={18} className="text-clay-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-ink-800">Join request pending</p>
              <p className="text-xs text-ink-500">
                Waiting for {request.supervisorId?.name} to respond.
              </p>
            </div>
          </Card>
        )}

        {suggested.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={15} className="text-forest-600" />
              <h2 className="text-sm font-semibold text-ink-700 uppercase tracking-wide">Suggested for you</h2>
            </div>
            <div className="space-y-3 mb-8">
              {suggested.map((s) => (
                <SupervisorRow
                  key={s._id}
                  sup={s}
                  onSend={handleSend}
                  disabled={!!request || sendingId === s._id}
                />
              ))}
            </div>
          </>
        )}

        <h2 className="text-sm font-semibold text-ink-700 uppercase tracking-wide mb-3">All supervisors</h2>
        <div className="space-y-3">
          {others.map((s) => (
            <SupervisorRow
              key={s._id}
              sup={s}
              onSend={handleSend}
              disabled={!!request || sendingId === s._id}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function SupervisorRow({ sup, onSend, disabled }) {
  return (
    <Card className="p-4 flex items-center justify-between gap-4">
      <div>
        <p className="font-medium text-ink-900 text-sm">{sup.name}</p>
        <p className="text-xs text-ink-500">{sup.school} · {sup.department}</p>
      </div>
      <Button variant="secondary" onClick={() => onSend(sup._id)} disabled={disabled} className="shrink-0">
        {disabled ? 'Requested' : 'Send request'}
      </Button>
    </Card>
  )
}