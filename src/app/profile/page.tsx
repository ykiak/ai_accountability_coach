'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState('')
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [heightCm, setHeightCm] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [bio, setBio] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const loadUserProfile = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        router.push('/')
        return
      }

      setUserId(user.id)

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('name, birth_date, height_cm, weight_kg, bio')
        .eq('user_id', user.id)
        .single()

      if (!error && profile) {
        setName(profile.name || '')
        setBirthDate(profile.birth_date || '')
        setHeightCm(profile.height_cm ? String(profile.height_cm) : '')
        setWeightKg(profile.weight_kg ? String(profile.weight_kg) : '')
        setBio(profile.bio || '')
      }

      setLoading(false)
    }

    loadUserProfile()
  }, [router])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const { error } = await supabase
      .from('user_profiles')
      .upsert(
        {
          user_id: userId,
          name: name,
          birth_date: birthDate || null,
          height_cm: heightCm ? parseInt(heightCm, 10) : null,
          weight_kg: weightKg ? parseFloat(weightKg) : null,
          bio
        },
        { onConflict: 'user_id' }
      )

    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage('Profile updated')
    }

    setSaving(false)
  }

  if (loading) {
    return <p>Loading...</p>
  }

  return (
    <div>
      <h1>My Profile</h1>
      <form onSubmit={handleSave}>
        <div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
          />
        </div>

        <div>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
        </div>

        <div>
          <input
            type="number"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            placeholder="Height (cm)"
          />
        </div>

        <div>
          <input
            type="number"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            placeholder="Weight (kg)"
            step="0.1"
          />
        </div>

        <div>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell me a bit about yourself."
          />
        </div>

        <button
          type="submit"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>
      <Link href={'/dashboard'}>Return</Link>
      {message && <p>{message}</p>}
    </div>
  )
}
