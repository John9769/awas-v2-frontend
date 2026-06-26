'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Button from '@/components/Button'
import Input from '@/components/Input'
import { sealWrit } from '@/lib/api'
import { getDriverToken, removeDriverToken } from '@/lib/auth'

export default function RecordPage() {
  const router = useRouter()
  const videoInputRef = useRef(null)
  const imageInputRef = useRef(null)
  const [video, setVideo] = useState(null)
  const [images, setImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [locationStatus, setLocationStatus] = useState('getting')
  const [incidentDescription, setIncidentDescription] = useState('')
  const [roadCondition, setRoadCondition] = useState('')
  const [weatherCondition, setWeatherCondition] = useState('')
  const [injuryStatus, setInjuryStatus] = useState('')
  const [otherVehiclePlate, setOtherVehiclePlate] = useState('')
  const [otherVehicleMakeModel, setOtherVehicleMakeModel] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleLogout() {
    removeDriverToken()
    router.push('/login')
  }

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toString())
        setLongitude(pos.coords.longitude.toString())
        setLocationStatus('done')
      },
      () => {
        setLocationStatus('failed')
      },
      { enableHighAccuracy: true, timeout: 15000 }
    )
  }, [])

  function handleVideoCapture(e) {
    const file = e.target.files[0]
    if (file) setVideo(file)
  }

  function handleImageCapture(e) {
    const newFiles = Array.from(e.target.files)
    const combined = [...images, ...newFiles].slice(0, 4)
    setImages(combined)
    setImagePreviews(combined.map((f) => URL.createObjectURL(f)))
  }

  function removeImage(index) {
    const newImages = images.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    setImages(newImages)
    setImagePreviews(newPreviews)
  }

  async function handleSubmit() {
    setError('')
    if (!video) return setError('Video is required.')
    if (locationStatus !== 'done') return setError('Location not captured. Please enable GPS and reload.')
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
      router.push('/writ/' + slug)
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

        {/* Location — auto captured */}
        <div className={`rounded-2xl border p-4 ${locationStatus === 'done' ? 'bg-green-50 border-green-200' : locationStatus === 'failed' ? 'bg-red-50 border-red-200' : 'bg-white border-brand-border'}`}>
          {locationStatus === 'getting' && <p className="text-sm text-brand-muted">📍 Getting your location...</p>}
          {locationStatus === 'done' && <p className="text-sm text-brand-green font-medium">📍 Location captured: {parseFloat(latitude).toFixed(5)}, {parseFloat(longitude).toFixed(5)}</p>}
          {locationStatus === 'failed' && <p className="text-sm text-brand-red font-medium">📍 Location failed. Enable GPS and reload page.</p>}
        </div>

        {/* Video */}
        <div className="bg-white rounded-2xl border border-brand-border p-5">
          <p className="text-sm font-semibold text-brand-text mb-3">Video Evidence *</p>
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            capture="environment"
            onChange={handleVideoCapture}
            className="hidden"
          />
          <button
            onClick={() => videoInputRef.current.click()}
            className="w-full py-4 rounded-xl border-2 border-dashed border-brand-green text-brand-green font-medium text-sm flex flex-col items-center gap-2"
          >
            <span className="text-3xl">🎥</span>
            <span>{video ? 'Change Video' : 'Tap to Record Video'}</span>
          </button>
          {video && (
            <p className="text-xs text-brand-green mt-2">✓ {video.name}</p>
          )}
        </div>

        {/* Images */}
        <div className="bg-white rounded-2xl border border-brand-border p-5">
          <p className="text-sm font-semibold text-brand-text mb-3">Photos — max 4 (optional)</p>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageCapture}
            className="hidden"
          />
          {images.length < 4 && (
            <button
              onClick={() => imageInputRef.current.click()}
              className="w-full py-4 rounded-xl border-2 border-dashed border-brand-border text-brand-muted font-medium text-sm flex flex-col items-center gap-2 mb-3"
            >
              <span className="text-3xl">📷</span>
              <span>Tap to Take Photo ({images.length}/4)</span>
            </button>
          )}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-2">
              {imagePreviews.map((src, i) => (
                <div key={i} className="relative">
                  <img
                    src={src}
                    alt={'Photo ' + (i + 1)}
                    className="w-full aspect-square object-cover rounded-xl"
                  />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-brand-red text-white rounded-full text-xs flex items-center justify-center font-bold"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Incident details */}
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
              <option value="DRY">Dry</option>
              <option value="WET">Wet</option>
              <option value="FLOODED">Flooded</option>
              <option value="UNDER_CONSTRUCTION">Under Construction</option>
              <option value="UNKNOWN">Unknown</option>
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
              <option value="CLEAR">Clear</option>
              <option value="RAINY">Rainy</option>
              <option value="FOGGY">Foggy</option>
              <option value="HAZY">Hazy</option>
              <option value="NIGHT">Night</option>
              <option value="UNKNOWN">Unknown</option>
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
              <option value="NONE">No Injury</option>
              <option value="MINOR">Minor Injury</option>
              <option value="SERIOUS">Serious Injury</option>
            </select>
          </div>
        </div>

        {/* Other vehicle */}
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