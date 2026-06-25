'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Input from '@/components/Input'
import { getInsurers, createInsurer, toggleInsurerStatus } from '@/lib/api'
import { isAdminLoggedIn } from '@/lib/auth'

export default function AdminInsurersPage() {
  const router = useRouter()
  const [insurers, setInsurers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '', code: '', email: '', contactPerson: '', phone: ''
  })

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.push('/admin'); return }
    fetchInsurers()
  }, [])

  async function fetchInsurers() {
    try {
      const res = await getInsurers()
      setInsurers(res.insurers || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    setError('')
    setSuccess('')
    if (!form.name || !form.code || !form.email || !form.contactPerson || !form.phone) {
      return setError('All fields are required.')
    }
    setSubmitting(true)
    try {
      await createInsurer(form)
      setSuccess('Insurer created. Temp password emailed.')
      setForm({ name: '', code: '', email: '', contactPerson: '', phone: '' })
      setShowForm(false)
      fetchInsurers()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggle(id) {
    try {
      await toggleInsurerStatus(id)
      fetchInsurers()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="bg-white border-b border-brand-border px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-green rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="font-semibold text-brand-text">AWAS Admin</span>
        </div>
        <Link href="/admin" className="text-sm text-brand-muted hover:underline">← Back</Link>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-brand-text">Insurers</h2>
            <p className="text-sm text-brand-muted mt-1">{insurers.length} insurer(s)</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-brand-green text-white rounded-xl text-sm font-medium hover:opacity-90"
          >
            {showForm ? 'Cancel' : '+ Add Insurer'}
          </button>
        </div>

        {/* Add insurer form */}
        {showForm && (
          <Card>
            <p className="text-sm font-semibold text-brand-text mb-4">New Insurer</p>
            <div className="flex flex-col gap-3">
              <Input label="Company Name" id="name" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Etiqa Insurance" />
              <Input label="Code" id="code" value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="e.g. ETIQA" />
              <Input label="Email" id="email" type="email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="contact@etiqa.com" />
              <Input label="Contact Person" id="contactPerson" value={form.contactPerson}
                onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                placeholder="Full name" />
              <Input label="Phone" id="phone" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="e.g. 0123456789" />

              {error && (
                <p className="text-sm text-brand-red bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}
              {success && (
                <p className="text-sm text-brand-green bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  ✓ {success}
                </p>
              )}
              <Button onClick={handleCreate} disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Insurer'}
              </Button>
            </div>
          </Card>
        )}

        {error && !showForm && (
          <p className="text-sm text-brand-red bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-sm text-brand-muted text-center py-8">Loading...</p>
        ) : insurers.length === 0 ? (
          <Card>
            <p className="text-sm text-brand-muted text-center py-4">No insurers yet.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {insurers.map((insurer) => (
              <Card key={insurer.id}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-brand-text">{insurer.name}</p>
                    <p className="text-xs text-brand-muted mt-1">{insurer.code}</p>
                    <p className="text-xs text-brand-muted mt-1">{insurer.email}</p>
                    <p className="text-xs text-brand-muted mt-1">{insurer.contactPerson} · {insurer.phone}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${insurer.status === 'ACTIVE' ? 'bg-green-100 text-brand-green' : 'bg-red-100 text-brand-red'}`}>
                      {insurer.status}
                    </span>
                    <button
                      onClick={() => handleToggle(insurer.id)}
                      className="text-xs text-brand-muted hover:text-brand-red underline"
                    >
                      {insurer.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}