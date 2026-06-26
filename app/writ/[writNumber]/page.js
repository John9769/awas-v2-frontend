'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Card from '@/components/Card'
import { getWrit } from '@/lib/api'

export default function WritPage() {
  const { writNumber } = useParams()
  const [writ, setWrit] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getWrit(writNumber)
      .then((data) => setWrit(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [writNumber])

  if (loading) return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center">
      <p className="text-brand-muted text-sm">Loading writ...</p>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-brand-red text-sm">{error}</p>
        <Link href="/dashboard" className="block mt-4 text-sm text-brand-green hover:underline">Back to Dashboard</Link>
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
          <span className="font-semibold text-brand-text">AWAS</span>
        </div>
        <Link href="/dashboard" className="text-sm text-brand-muted hover:underline">Back</Link>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-5">

        {/* Police Guidance */}
        <div className="bg-brand-green rounded-2xl p-4">
          <p className="text-white font-bold text-sm mb-1">Show this to the Police</p>
          <p className="text-green-100 text-xs">Quote your writ number when making a police report. This document is SHA-256 sealed and tamper-proof. Your insurer has been automatically notified.</p>
          <p className="text-white font-bold text-sm mt-2">{writ.writNumber}</p>
        </div>

        {/* Writ status */}
        <Card>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs text-brand-muted uppercase tracking-wide">Writ Number</p>
              <p className="text-lg font-bold text-brand-text mt-1">{writ.writNumber}</p>
            </div>
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${writ.writStatus === 'SEALED' ? 'bg-green-100 text-brand-green' : 'bg-yellow-100 text-yellow-700'}`}>
              {writ.writStatus}
            </span>
          </div>
          <p className="text-xs text-brand-muted">
            Recorded: {new Date(writ.createdAt).toLocaleString('en-MY')}
          </p>
          {writ.videoSealedAt && (
            <p className="text-xs text-brand-muted mt-1">
              Sealed: {new Date(writ.videoSealedAt).toLocaleString('en-MY')}
            </p>
          )}
        </Card>

        {/* Hashes */}
        <Card>
          <p className="text-xs text-brand-muted uppercase tracking-wide mb-2">SHA-256 Master Hash</p>
          <p className="text-xs font-mono text-brand-text break-all">{writ.logHash}</p>
          {writ.videoHash && (
            <>
              <p className="text-xs text-brand-muted uppercase tracking-wide mt-3 mb-1">Video Hash</p>
              <p className="text-xs font-mono text-brand-text break-all">{writ.videoHash}</p>
            </>
          )}
          {writ.imageHashes && writ.imageHashes.length > 0 && (
            <>
              <p className="text-xs text-brand-muted uppercase tracking-wide mt-3 mb-1">Image Hashes</p>
              {writ.imageHashes.map((hash, i) => (
                <div key={i} className="mt-1">
                  <p className="text-xs text-brand-muted">Photo {i + 1}</p>
                  <p className="text-xs font-mono text-brand-text break-all">{hash}</p>
                </div>
              ))}
            </>
          )}
        </Card>

        {/* Location with map */}
        {writ.latitude && writ.longitude && (
          <Card>
            <p className="text-xs text-brand-muted uppercase tracking-wide mb-2">Accident Location</p>
            <p className="text-sm text-brand-text mb-3">
              {parseFloat(writ.latitude).toFixed(5)}, {parseFloat(writ.longitude).toFixed(5)}
            </p>
            <iframe
              width="100%"
              height="200"
              style={{ border: 0, borderRadius: '12px' }}
              loading="lazy"
              allowFullScreen
              src={"https://maps.google.com/maps?q=" + writ.latitude + "," + writ.longitude + "&z=16&output=embed"}
            />
          </Card>
        )}

        {/* Incident details */}
        <Card>
          <p className="text-xs text-brand-muted uppercase tracking-wide mb-3">Incident Details</p>
          <div className="flex flex-col gap-2">
            <div>
              <p className="text-xs text-brand-muted">Description</p>
              <p className="text-sm text-brand-text mt-0.5">{writ.incidentDescription}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <div>
                <p className="text-xs text-brand-muted">Road</p>
                <p className="text-sm text-brand-text mt-0.5">{writ.roadCondition}</p>
              </div>
              <div>
                <p className="text-xs text-brand-muted">Weather</p>
                <p className="text-sm text-brand-text mt-0.5">{writ.weatherCondition}</p>
              </div>
              <div>
                <p className="text-xs text-brand-muted">Injury</p>
                <p className="text-sm text-brand-text mt-0.5">{writ.injuryStatus}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Other vehicle */}
        {writ.otherVehiclePlate && (
          <Card>
            <p className="text-xs text-brand-muted uppercase tracking-wide mb-3">Other Vehicle</p>
            <p className="text-sm font-semibold text-brand-text">{writ.otherVehiclePlate}</p>
            {writ.otherVehicleMakeModel && (
              <p className="text-sm text-brand-muted mt-1">{writ.otherVehicleMakeModel}</p>
            )}
          </Card>
        )}

        {/* Video */}
        {writ.videoUrl && (
          <Card>
            <p className="text-xs text-brand-muted uppercase tracking-wide mb-3">Video Evidence</p>
            <video controls className="w-full rounded-xl" src={writ.videoUrl} />
          </Card>
        )}

        {/* Photos */}
        {writ.imageUrls && writ.imageUrls.length > 0 && (
          <Card>
            <p className="text-xs text-brand-muted uppercase tracking-wide mb-3">
              Photos ({writ.imageUrls.length})
            </p>
            <div className="grid grid-cols-2 gap-2">
              {writ.imageUrls.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={"Evidence " + (i + 1)}
                  className="w-full rounded-xl object-cover aspect-square"
                />
              ))}
            </div>
          </Card>
        )}

        <div className="pb-8" />
      </div>
    </div>
  )
}