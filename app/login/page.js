'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { driverLogin } from '@/lib/api'
import { saveDriverToken } from '@/lib/auth'
import Button from '@/components/Button'

export default function DriverLoginPage() {
  const router = useRouter()
  const [vehiclePlate, setVehiclePlate] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setError('')
    if (!vehiclePlate || !password) return setError('Enter your plate number and password.')
    setLoading(true)
    try {
      const data = await driverLogin({ vehiclePlate: vehiclePlate.toUpperCase(), password })
      saveDriverToken(data.token)
      if (data.mustChangePassword) {
        router.push('/change-password')
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-start pt-16 px-4">
      {/* Video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        src="/awas-logo-animation.mp4"
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-xs flex flex-col items-center gap-6">
        {/* AWAS branding */}
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white tracking-widest drop-shadow-lg">AWAS</h1>
          <p className="text-xs text-white/50 mt-2 tracking-widest uppercase">Accident Writ Automation System</p>
        </div>

        {/* Dark frosted glass card */}
        <div className="w-full bg-black/50 backdrop-blur-md rounded-2xl p-6 border border-white/10">
          <p className="text-white font-semibold text-sm mb-5 tracking-wide">Driver Login</p>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/50 uppercase tracking-widest">Plate Number</label>
              <input
                type="text"
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                placeholder="e.g. WXY1234"
                className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-brand-green text-sm border border-white/10"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/50 uppercase tracking-widest">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-brand-green text-sm border border-white/10"
              />
            </div>

            {error && (
              <p className="text-xs text-white bg-red-500/60 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <Button onClick={handleLogin} disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </Button>

            <div className="text-center">
              <Link href="/forgot-password" className="text-xs text-white/40 hover:text-white/70">
                Forgot password?
              </Link>
            </div>
          </div>
        </div>

        <p className="text-xs text-white/30">
          Are you an insurer?{' '}
          <Link href="/insurer/login" className="text-white/60 font-medium hover:text-white">
            Insurer Login
          </Link>
        </p>
      </div>
    </div>
  )
}