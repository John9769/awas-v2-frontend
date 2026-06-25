'use client'
import Link from 'next/link'

export default function Navbar({ role = 'driver', onLogout }) {
  return (
    <div className="bg-white border-b border-brand-border px-4 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-brand-green rounded-xl flex items-center justify-center">
          <span className="text-white font-bold text-sm">A</span>
        </div>
        <span className="font-semibold text-brand-text">AWAS</span>
      </div>
      <button
        onClick={onLogout}
        className="text-sm text-brand-muted hover:text-brand-red transition-colors"
      >
        Log Out
      </button>
    </div>
  )
}