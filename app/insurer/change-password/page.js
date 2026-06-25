'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Input from '@/components/Input'
import Button from '@/components/Button'
import { insurerChangePassword } from '@/lib/api'
import { getInsurerToken } from '@/lib/auth'

export default function InsurerChangePasswordPage() {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleChange() {
    setError('')
    if (!currentPassword || !newPassword || !confirm) return setError('All fields are required.')
    if (newPassword !== confirm) return setError('New passwords do not match.')
    if (newPassword.length < 8) return setError('Password must be at least 8 characters.')
    setLoading(true)
    try {
      const token = getInsurerToken()
      await insurerChangePassword(token, { currentPassword, newPassword })
      router.push('/insurer/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-green rounded-2xl mb-4">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <h1 className="text-2xl font-bold text-brand-text">Set New Password</h1>
          <p className="text-sm text-brand-muted mt-1">Required before you continue</p>
        </div>

        <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-sm">
          <div className="flex flex-col gap-4">
            <Input
              label="Temporary Password"
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="From your welcome email"
            />
            <Input
              label="New Password"
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 8 characters"
            />
            <Input
              label="Confirm New Password"
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat new password"
            />
            {error && (
              <p className="text-sm text-brand-red bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {error}
              </p>
            )}
            <Button onClick={handleChange} disabled={loading}>
              {loading ? 'Saving...' : 'Set Password'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}