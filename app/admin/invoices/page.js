'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Input from '@/components/Input'
import { getAdminInvoices, generateWritInvoice, markInvoicePaid, getInsurers } from '@/lib/api'
import { isAdminLoggedIn } from '@/lib/auth'

export default function AdminInvoicesPage() {
  const router = useRouter()
  const [invoices, setInvoices] = useState([])
  const [insurers, setInsurers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    insurerId: '', periodStart: '', periodEnd: ''
  })

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.push('/admin'); return }
    Promise.all([getAdminInvoices(), getInsurers()])
      .then(([inv, ins]) => {
        setInvoices(inv.invoices || [])
        setInsurers(ins.insurers || [])
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleGenerate() {
    setError('')
    setSuccess('')
    if (!form.insurerId || !form.periodStart || !form.periodEnd) {
      return setError('All fields are required.')
    }
    setSubmitting(true)
    try {
      await generateWritInvoice(form)
      setSuccess('Writ invoice generated successfully.')
      setForm({ insurerId: '', periodStart: '', periodEnd: '' })
      setShowForm(false)
      const res = await getAdminInvoices()
      setInvoices(res.invoices || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleMarkPaid(id) {
    try {
      await markInvoicePaid(id)
      const res = await getAdminInvoices()
      setInvoices(res.invoices || [])
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
        <Link href="/admin" className="text-sm text-brand-muted hover:underline">Back</Link>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-brand-text">Invoices</h2>
            <p className="text-sm text-brand-muted mt-1">{invoices.length} invoice(s)</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-brand-green text-white rounded-xl text-sm font-medium hover:opacity-90"
          >
            {showForm ? 'Cancel' : '+ Generate Writ Invoice'}
          </button>
        </div>

        {showForm && (
          <Card>
            <p className="text-sm font-semibold text-brand-text mb-4">Generate Writ Invoice</p>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-brand-text">Insurer</label>
                <select
                  value={form.insurerId}
                  onChange={(e) => setForm({ ...form, insurerId: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-brand-text text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
                >
                  <option value="">Select insurer</option>
                  {insurers.map((ins) => (
                    <option key={ins.id} value={ins.id}>{ins.name}</option>
                  ))}
                </select>
              </div>
              <Input
                label="Period Start"
                id="periodStart"
                type="date"
                value={form.periodStart}
                onChange={(e) => setForm({ ...form, periodStart: e.target.value })}
              />
              <Input
                label="Period End"
                id="periodEnd"
                type="date"
                value={form.periodEnd}
                onChange={(e) => setForm({ ...form, periodEnd: e.target.value })}
              />
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
              <Button onClick={handleGenerate} disabled={submitting}>
                {submitting ? 'Generating...' : 'Generate Invoice'}
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
        ) : invoices.length === 0 ? (
          <Card>
            <p className="text-sm text-brand-muted text-center py-4">No invoices yet.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {invoices.map((invoice) => (
              <Card key={invoice.id}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-brand-text">{invoice.invoiceNumber}</p>
                    <p className="text-xs text-brand-muted mt-1">{invoice.insurer?.name}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block mt-1 ${invoice.invoiceType === 'ONBOARDING' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                      {invoice.invoiceType === 'ONBOARDING' ? 'Onboarding' : 'Writ'}
                    </span>
                    <p className="text-xs text-brand-muted mt-1">
                      {new Date(invoice.periodStart).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-brand-muted mt-1">
                      {invoice.totalUnits} {invoice.invoiceType === 'ONBOARDING' ? 'policies' : 'writs'} × RM{parseFloat(invoice.unitFee).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <p className="text-sm font-bold text-brand-text">
                      RM {parseFloat(invoice.totalAmount).toFixed(2)}
                    </p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${invoice.isPaid ? 'bg-green-100 text-brand-green' : 'bg-yellow-100 text-yellow-700'}`}>
                      {invoice.isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                    {!invoice.isPaid && (
                      <button
                        onClick={() => handleMarkPaid(invoice.id)}
                        className="text-xs text-brand-green underline hover:opacity-80"
                      >
                        Mark as Paid
                      </button>
                    )}
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