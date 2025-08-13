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
    return <p className="text-center mt-20 text-blue-700 font-semibold">Loading...</p>
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#3432c7] to-[#000000] p-6 font-sans flex justify-center">
      <section className="bg-white rounded-lg shadow p-8 w-full max-w-lg mx-4">
        <h1 className="text-3xl font-extrabold text-blue-800 mb-8 text-center">My Profile</h1>

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            required
            className="w-full px-4 py-3 border border-gray-400 rounded shadow-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
          />

          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full px-4 py-3 border border-gray-400 rounded shadow-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
          />

          <input
            type="number"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            placeholder="Height (cm)"
            className="w-full px-4 py-3 border border-gray-400 rounded shadow-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
          />

          <input
            type="number"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            placeholder="Weight (kg)"
            step="0.1"
            className="w-full px-4 py-3 border border-gray-400 rounded shadow-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
          />

          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell me a bit about yourself."
            rows={4}
            className="w-full px-4 py-3 border border-gray-400 rounded shadow-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-600 transition resize-none"
          />

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded font-semibold transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </form>

        <p className="mt-8 text-center text-blue-700 font-semibold hover:underline">
          <Link href="/dashboard">Return</Link>
        </p>

        {message && (
          <p className="mt-6 text-center text-sm text-red-600 font-medium">{message}</p>
        )}
      </section>
    </main>
  )
}
