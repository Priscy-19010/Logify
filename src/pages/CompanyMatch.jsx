import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Clock, User as UserIcon } from 'lucide-react'
import { useApp } from '../context/AppContext'
import Navbar from '../components/Navbar'
import { Button, Card, Field, Input } from '../components/ui'

export default function CompanyMatch() {
  const { getStudentProfile, listCompanies, sendCompanyRequest, getCompanyRequestForStudent } = useApp()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [companies, setCompanies] = useState([])
  const [request, setRequest] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [staffName, setStaffName] = useState('')
  const [staffPhone, setStaffPhone] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const [profile, fetchedRequest] = await Promise.all([
        getStudentProfile(),
        getCompanyRequestForStudent(),
      ])
      if (!profile) { navigate('/onboarding'); return }
      if (profile.companyId) { navigate('/student'); return }
      if (fetchedRequest?.status === 'accepted') { navigate('/student'); return }

      setRequest(fetchedRequest)
      const list = await listCompanies()
      setCompanies(list)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSend() {
    if (!selectedId || !staffName.trim() || !staffPhone.trim()) {
      setError('Select a company and fill in your staff contact details.')
      return
    }
    setSending(true)
    setError('')
    try {
      await sendCompanyRequest(selectedId, staffName.trim(), staffPhone.trim())
      const updated = await getCompanyRequestForStudent()
      setRequest(updated)
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-50">
        <Navbar />
        <p className="text-center text-ink-500 mt-20">Loading companies…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="font-display text-2xl font-semibold text-ink-900">Connect to your company</h1>
        <p className="text-ink-500 text-sm mt-1 mb-6">
          Find the organisation where you're doing your IT and send them a request. They'll need to accept before they can see and approve your logs.
        </p>

        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-6">{error}</p>}

        {request && (
          <Card className="p-4 mb-6 flex items-center gap-3 border-clay-200 bg-clay-50/60">
            <Clock size={18} className="text-clay-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-ink-800">Request pending</p>
              <p className="text-xs text-ink-500">
                Waiting for {request.companyId?.name} to accept your request.
              </p>
            </div>
          </Card>
        )}

        {!request && companies.length === 0 && (
          <Card className="p-5 text-sm text-ink-400">
            No companies are registered on Logify yet. Check back once your organisation signs up, or ask them to create a company account.
          </Card>
        )}

        {!request && companies.length > 0 && (
          <div className="space-y-3">
            {companies.map((c) => (
              <Card key={c._id} className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Building2 size={16} className="text-trust-600" />
                    <span className="font-medium text-ink-900 text-sm">{c.name}</span>
                  </div>
                  <Button
                    variant={selectedId === c._id ? 'primary' : 'secondary'}
                    onClick={() => setSelectedId(c._id)}
                  >
                    {selectedId === c._id ? 'Selected' : 'Select'}
                  </Button>
                </div>

                {selectedId === c._id && (
                  <div className="mt-4 pt-4 border-t border-ink-100 space-y-3">
                    <Field label="Your staff contact's name">
                      <Input value={staffName} onChange={(e) => setStaffName(e.target.value)} placeholder="e.g. Mrs. Adaobi Eze" />
                    </Field>
                    <Field label="Staff contact's phone">
                      <Input value={staffPhone} onChange={(e) => setStaffPhone(e.target.value)} placeholder="e.g. 08012345678" />
                    </Field>
                    <Button onClick={handleSend} disabled={sending} className="flex items-center gap-2">
                      <UserIcon size={14} /> {sending ? 'Sending…' : 'Send request'}
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}