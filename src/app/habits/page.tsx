'use client'
import { useState, useEffect} from 'react'
import { supabase } from '@/lib/supabaseClient'

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
    <div>
      <h1>Register Habit</h1>
      <form onSubmit={handleSubmit}>
        
        <div>
          <select
            value={habitType}
            onChange={(e) => setHabitType(e.target.value)}
          >
            <option value="health">Health</option>
            <option value="fitness">Fitness</option>
            <option value="productivity">Productivity</option>
          </select>
        </div>

        <div>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Drink 2L of water a day"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Habit'}
        </button>
      </form>

      {message && <p className="mt-4">{message}</p>}
    </div>
  )
}
