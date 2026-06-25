'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Input from '@/components/Input'
import Button from '@/components/Button'
import { driverResetPassword } from '@/lib/api'

function ResetForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleReset() {
    setError('')
    if (!newPassword || !confirm) return setError('All fields are required.')
    if (newPassword !== confirm) return setError('Passwords do not match.')
    if (newPassword.length < 8) return setError('Password must be at least 8 characters.')
    setLoading(true)
    try {
      await driverResetPassword({ token, newPassword })
      router.push('/login')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        label="New Password"
        id="newPassword"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="Min. 8 characters"
      />
      <Input
        label="Confirm Password"
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
      <Button onClick={handleReset} disabled={loading}>
        {loading ? 'Saving...' : 'Reset Password'}
      </Button>
      <Link href="/login" className="text-center text-sm text-brand-muted hover:underline">
        Back to Login
      </Link>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-green rounded-2xl mb-4">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <h1 className="text-2xl font-bold text-brand-text">New Password</h1>
          <p className="text-sm text-brand-muted mt-1">Enter your new password below</p>
        </div>
        <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-sm">
          <Suspense fallback={<p className="text-sm text-brand-muted">Loading...</p>}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}