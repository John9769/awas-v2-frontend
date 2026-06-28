'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Input from '@/components/Input'
import { getAdminDashboard } from '@/lib/api'
import { isAdminLoggedIn, saveAdminSession, removeAdminSession } from '@/lib/auth'

export default function AdminPage() {
  const router = useRouter()
  const [authed, setAuthed] = useState(false)
  const [key, setKey] = useState('')
  const [keyError, setKeyError] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isAdminLoggedIn()) {
      setAuthed(true)
      fetchDashboard()
    }
  }, [])

  function handleKeySubmit() {
    setKeyError('')
    if (key !== process.env.NEXT_PUBLIC_ADMIN_KEY) {
      return setKeyError('Invalid admin key.')
    }
    saveAdminSession()
    setAuthed(true)
    fetchDashboard()
  }

  async function fetchDashboard() {
    setLoading(true)
    try {
      const res = await getAdminDashboard()
      setData(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    removeAdminSession()
    setAuthed(false)
    setData(null)
  }

  if (!authed) return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-green rounded-2xl mb-4">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <h1 className="text-2xl font-bold text-brand-text">Admin</h1>
          <p className="text-sm text-brand-muted mt-1">AWAS Control Panel</p>
        </div>
        <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-sm">
          <div className="flex flex-col gap-4">
            <Input
              label="Admin Key"
              id="key"
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Enter admin key"
            />
            {keyError && (
              <p className="text-sm text-brand-red bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {keyError}
              </p>
            )}
            <Button onClick={handleKeySubmit}>Enter</Button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="bg-white border-b border-brand-border px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-green rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="font-semibold text-brand-text">AWAS Admin</span>
        </div>
        <button onClick={handleLogout} className="text-sm text-brand-muted hover:text-brand-red">
          Log Out
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">
        {error && (
          <p className="text-sm text-brand-red bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        {data && (
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <p className="text-xs text-brand-muted uppercase tracking-wide mb-1">Insurers</p>
              <p className="text-2xl font-bold text-brand-text">{data.insurers?.total ?? 0}</p>
              <p className="text-xs text-brand-muted mt-1">{data.insurers?.active ?? 0} active</p>
            </Card>
            <Card>
              <p className="text-xs text-brand-muted uppercase tracking-wide mb-1">Drivers</p>
              <p className="text-2xl font-bold text-brand-text">{data.drivers?.total ?? 0}</p>
              <p className="text-xs text-brand-muted mt-1">{data.drivers?.active ?? 0} active</p>
            </Card>
            <Card>
              <p className="text-xs text-brand-muted uppercase tracking-wide mb-1">Submitted Writs</p>
              <p className="text-2xl font-bold text-brand-green">{data.writs?.submitted ?? 0}</p>
              <p className="text-xs text-brand-muted mt-1">{data.writs?.total ?? 0} total</p>
            </Card>
            <Card>
              <p className="text-xs text-brand-muted uppercase tracking-wide mb-1">Unpaid Invoices</p>
              <p className="text-2xl font-bold text-brand-red">{data.invoices?.unpaid ?? 0}</p>
              <p className="text-xs text-brand-muted mt-1">{data.invoices?.total ?? 0} total</p>
            </Card>
            <Card>
              <p className="text-xs text-brand-muted uppercase tracking-wide mb-1">Portal Users</p>
              <p className="text-2xl font-bold text-brand-text">{data.insurerUsers?.total ?? 0}</p>
            </Card>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Link href="/admin/insurers">
            <Card className="hover:border-brand-green transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-brand-text">Insurers</p>
                  <p className="text-xs text-brand-muted mt-1">Manage insurer accounts + HOC users</p>
                </div>
                <span className="text-brand-muted">→</span>
              </div>
            </Card>
          </Link>

          <Link href="/admin/drivers">
            <Card className="hover:border-brand-green transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-brand-text">Drivers</p>
                  <p className="text-xs text-brand-muted mt-1">View all policyholders</p>
                </div>
                <span className="text-brand-muted">→</span>
              </div>
            </Card>
          </Link>

          <Link href="/admin/writs">
            <Card className="hover:border-brand-green transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-brand-text">Writs</p>
                  <p className="text-xs text-brand-muted mt-1">View all accident records</p>
                </div>
                <span className="text-brand-muted">→</span>
              </div>
            </Card>
          </Link>

          <Link href="/admin/invoices">
            <Card className="hover:border-brand-green transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-brand-text">Invoices</p>
                  <p className="text-xs text-brand-muted mt-1">Generate and manage AWAS invoices</p>
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