'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Button from '@/components/Button'
import Input from '@/components/Input'
import { sealWrit } from '@/lib/api'
import { getDriverToken, removeDriverToken } from '@/lib/auth'

export default function RecordPage() {
  const router = useRouter()
  const [video, setVideo] = useState(null)
  const [images, setImages] = useState([])
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [incidentDescription, setIncidentDescription] = useState('')
  const [roadCondition, setRoadCondition] = useState('')
  const [weatherCondition, setWeatherCondition] = useState('')
  const [injuryStatus, setInjuryStatus] = useState('')
  const [otherVehiclePlate, setOtherVehiclePlate] = useState('')
  const [otherVehicleMakeModel, setOtherVehicleMakeModel] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)

  function handleLogout() {
    removeDriverToken()
    router.push('/login')
  }

  function getLocation() {
    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toString())
        setLongitude(pos.coords.longitude.toString())
        setLocationLoading(false)
      },
      () => {
        setError('Could not get location. Please enable GPS.')
        setLocationLoading(false)
      }
    )
  }

  async function handleSubmit() {
    setError('')
    if (!video) return setError('Video is required.')
    if (!latitude || !longitude) return setError('Location is required. Tap Get Location.')
    if (!incidentDescription) return setError('Describe the incident.')
    if (!roadCondition) return setError('Road condition is required.')
    if (!weatherCondition) return setError('Weather condition is required.')
    if (!injuryStatus) return setError('Injury status is required.')

    setLoading(true)
    try {
      const token = getDriverToken()
      const formData = new FormData()
      formData.append('video', video)
      images.forEach((img) => formData.append('images', img))
      formData.append('latitude', latitude)
      formData.append('longitude', longitude)
      formData.append('incidentDescription', incidentDescription)
      formData.append('roadCondition', roadCondition)
      formData.append('weatherCondition', weatherCondition)
      formData.append('injuryStatus', injuryStatus)
      if (otherVehiclePlate) formData.append('otherVehiclePlate', otherVehiclePlate.toUpperCase())
      if (otherVehicleMakeModel) formData.append('otherVehicleMakeModel', otherVehicleMakeModel)

      const data = await sealWrit(token, formData)
      const slug = data.writNumber.replace(/\//g, '-')
      router.push(`/writ/${slug}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <Navbar onLogout={handleLogout} />

      <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-5">
        <div>
          <h2 className="text-lg font-bold text-brand-text">Record Accident</h2>
          <p className="text-sm text-brand-muted mt-1">All evidence will be sealed with SHA-256 hash</p>
        </div>

        <div className="bg-white rounded-2xl border border-brand-border p-5">
          <p className="text-sm font-semibold text-brand-text mb-3">Video Evidence *</p>
          <input
            type="file"
            accept="video/*"
            capture="environment"
            onChange={(e) => setVideo(e.target.files[0])}
            className="w-full text-sm text-brand-muted file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-brand-green file:text-white file:text-sm file:font-medium"
          />
          {video && <p className="text-xs text-brand-green mt-2">✓ {video.name}</p>}
        </div>

        <div className="bg-white rounded-2xl border border-brand-border p-5">
          <p className="text-sm font-semibold text-brand-text mb-3">Photos (optional)</p>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setImages(Array.from(e.target.files))}
            className="w-full text-sm text-brand-muted file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-brand-bg file:text-brand-text file:text-sm file:font-medium file:border file:border-brand-border"
          />
          {images.length > 0 && <p className="text-xs text-brand-green mt-2">✓ {images.length} photo(s) selected</p>}
        </div>

        <div className="bg-white rounded-2xl border border-brand-border p-5">
          <p className="text-sm font-semibold text-brand-text mb-3">Location *</p>
          {latitude && longitude ? (
            <p className="text-xs text-brand-green mb-3">✓ Location captured: {parseFloat(latitude).toFixed(5)}, {parseFloat(longitude).toFixed(5)}</p>
          ) : null}
          <Button onClick={getLocation} variant="outline" disabled={locationLoading}>
            {locationLoading ? 'Getting location...' : '📍 Get Current Location'}
          </Button>
        </div>

        <div className="bg-white rounded-2xl border border-brand-border p-5 flex flex-col gap-4">
          <p className="text-sm font-semibold text-brand-text">Incident Details *</p>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-brand-text">Description</label>
            <textarea
              value={incidentDescription}
              onChange={(e) => setIncidentDescription(e.target.value)}
              placeholder="Describe what happened..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-green text-sm resize-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-brand-text">Road Condition</label>
            <select
              value={roadCondition}
              onChange={(e) => setRoadCondition(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green text-sm"
            >
              <option value="">Select condition</option>
              <option value="Dry">Dry</option>
              <option value="Wet">Wet</option>
              <option value="Flooded">Flooded</option>
              <option value="Under construction">Under construction</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-brand-text">Weather Condition</label>
            <select
              value={weatherCondition}
              onChange={(e) => setWeatherCondition(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green text-sm"
            >
              <option value="">Select condition</option>
              <option value="Clear">Clear</option>
              <option value="Raining">Raining</option>
              <option value="Heavy rain">Heavy rain</option>
              <option value="Foggy">Foggy</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-brand-text">Injury Status</label>
            <select
              value={injuryStatus}
              onChange={(e) => setInjuryStatus(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green text-sm"
            >
              <option value="">Select status</option>
              <option value="No injury">No injury</option>
              <option value="Minor injury">Minor injury</option>
              <option value="Serious injury">Serious injury</option>
              <option value="Fatality">Fatality</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-brand-border p-5 flex flex-col gap-4">
          <p className="text-sm font-semibold text-brand-text">Other Vehicle (optional)</p>
          <Input
            label="Plate Number"
            id="otherVehiclePlate"
            value={otherVehiclePlate}
            onChange={(e) => setOtherVehiclePlate(e.target.value.toUpperCase())}
            placeholder="e.g. ABC1234"
          />
          <Input
            label="Make & Model"
            id="otherVehicleMakeModel"
            value={otherVehicleMakeModel}
            onChange={(e) => setOtherVehicleMakeModel(e.target.value)}
            placeholder="e.g. Toyota Vios"
          />
        </div>

        {error && (
          <p className="text-sm text-brand-red bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Sealing writ...' : 'Seal & Submit Evidence'}
        </Button>

        <div className="pb-8" />
      </div>
    </div>
  )
}