'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Card from '@/components/Card'
import Navbar from '@/components/Navbar'
import { getInsurerDashboard } from '@/lib/api'
import { getInsurerToken, removeInsurerToken } from '@/lib/auth'

export default function InsurerDashboardPage() {
  const router = useRouter()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = getInsurerToken()
    if (!token) { router.push('/insurer/login'); return }
    getInsurerDashboard(token)
      .then((res) => setData(res))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  function handleLogout() {
    removeInsurerToken()
    router.push('/insurer/login')
  }

  if (loading) return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center">
      <p className="text-brand-muted text-sm">Loading...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-brand-bg">
      <Navbar onLogout={handleLogout} />

      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">
        {error && (
          <p className="text-sm text-brand-red bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        {/* Welcome */}
        {data && (
          <div>
            <h2 className="text-lg font-bold text-brand-text">{data.insurer?.name}</h2>
            <p className="text-sm text-brand-muted mt-1">Insurer Dashboard</p>
          </div>
        )}

        {/* Stats */}
        {data && (
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <p className="text-xs text-brand-muted uppercase tracking-wide mb-1">Total Policies</p>
              <p className="text-2xl font-bold text-brand-text">{data.totalDrivers ?? 0}</p>
            </Card>
            <Card>
              <p className="text-xs text-brand-muted uppercase tracking-wide mb-1">Active Policies</p>
              <p className="text-2xl font-bold text-brand-green">{data.activeDrivers ?? 0}</p>
            </Card>
            <Card>
              <p className="text-xs text-brand-muted uppercase tracking-wide mb-1">Total Writs</p>
              <p className="text-2xl font-bold text-brand-text">{data.totalWrits ?? 0}</p>
            </Card>
            <Card>
              <p className="text-xs text-brand-muted uppercase tracking-wide mb-1">This Month</p>
              <p className="text-2xl font-bold text-brand-text">{data.writsThisMonth ?? 0}</p>
            </Card>
          </div>
        )}

        {/* Navigation */}
        <div className="flex flex-col gap-3">
          <Link href="/insurer/policyholders">
            <Card className="hover:border-brand-green transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-brand-text">Policyholders</p>
                  <p className="text-xs text-brand-muted mt-1">View and manage your drivers</p>
                </div>
                <span className="text-brand-muted">→</span>
              </div>
            </Card>
          </Link>

          <Link href="/insurer/writs">
            <Card className="hover:border-brand-green transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-brand-text">Accident Writs</p>
                  <p className="text-xs text-brand-muted mt-1">View all sealed evidence records</p>
                </div>
                <span className="text-brand-muted">→</span>
              </div>
            </Card>
          </Link>

          <Link href="/insurer/csv-upload">
            <Card className="hover:border-brand-green transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-brand-text">Upload Policyholders</p>
                  <p className="text-xs text-brand-muted mt-1">Upload daily CSV to onboard drivers</p>
                </div>
                <span className="text-brand-muted">→</span>
              </div>
            </Card>
          </Link>

          <Link href="/insurer/invoices">
            <Card className="hover:border-brand-green transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-brand-text">Invoices</p>
                  <p className="text-xs text-brand-muted mt-1">View monthly invoices from AWAS</p>
                </div>
                <span className="text-brand-muted">→</span>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}