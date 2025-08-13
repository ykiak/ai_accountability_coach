'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

export default function HabitsPage() {
  const [habitType, setHabitType] = useState('health')
  const [userId, setUserId] = useState('')
  const [description, setDescription] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
    }
    getUser()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const user_id = userId

      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id,
          habit_type: habitType,
          description
        })
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Erro ao salvar hábito')
      }

      setMessage('Habit saved successfully!')
      setDescription('')
      setHabitType('health')
    } catch (error: any) {
      setMessage(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#3432c7] to-[#000000] p-6 font-sans flex justify-center items-center">
      <section className="bg-white rounded-lg shadow p-8 w-full max-w-md aspect-square mx-4 flex flex-col">
        <h1 className="text-3xl font-extrabold text-blue-800 mb-6 text-center">Register Habit</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 flex-grow">
          <select
            value={habitType}
            onChange={(e) => setHabitType(e.target.value)}
            className="w-full px-4 py-3 border border-gray-400 rounded shadow-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
          >
            <option value="health">Health</option>
            <option value="fitness">Fitness</option>
            <option value="productivity">Productivity</option>
          </select>

          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Drink 2L of water a day"
            required
            className="w-full px-4 py-3 border border-gray-400 rounded shadow-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded font-semibold transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Habit'}
          </button>
        </form>

        {message && (
          <p className="mt-6 text-center text-sm text-red-600 font-medium">{message}</p>
        )}

        <p className="mt-8 text-center text-blue-700 font-semibold hover:underline cursor-pointer">
          <Link href="/dashboard">Click here to return</Link>
        </p>
      </section>
    </main>
  )
}
