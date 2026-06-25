'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Card from '@/components/Card'
import Navbar from '@/components/Navbar'
import { getInsurerInvoices } from '@/lib/api'
import { getInsurerToken, removeInsurerToken } from '@/lib/auth'

export default function InsurerInvoicesPage() {
  const router = useRouter()
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  function handleLogout() {
    removeInsurerToken()
    router.push('/insurer/login')
  }

  useEffect(() => {
    const token = getInsurerToken()
    if (!token) { router.push('/insurer/login'); return }
    getInsurerInvoices(token)
      .then((res) => setInvoices(res.invoices || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-brand-bg">
      <Navbar onLogout={handleLogout} />

      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-brand-text">Invoices</h2>
            <p className="text-sm text-brand-muted mt-1">Monthly invoices from AWAS</p>
          </div>
          <Link href="/insurer/dashboard" className="text-sm text-brand-muted hover:underline">← Back</Link>
        </div>

        {error && (
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
                    <p className="text-xs text-brand-muted mt-1">
                      {new Date(invoice.periodStart).toLocaleDateString('en-MY', { month: 'long', year: 'numeric' })} —{' '}
                      {new Date(invoice.periodEnd).toLocaleDateString('en-MY', { month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-brand-muted mt-1">{invoice.totalPolicies} policies</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-brand-text">
                      RM {parseFloat(invoice.totalAmount).toFixed(2)}
                    </p>
                    <span className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${invoice.isPaid ? 'bg-green-100 text-brand-green' : 'bg-yellow-100 text-yellow-700'}`}>
                      {invoice.isPaid ? 'Paid' : 'Unpaid'}
                    </span>
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