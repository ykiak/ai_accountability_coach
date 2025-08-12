'use client'
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import LogoutButton from "@/components/LogoutButton"

export default function Dashboard() {
  const [user, setUser] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [conversation, setConversation] = useState<{role: string, content: string}[]>([])
  const [obj, setObj] = useState('')
  const [msg, setMsg] = useState('')
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (!mounted) return

      if (error || !session || !session.user) {
        router.push('/')
        return
      }

      const identifier =
        session.user.email ||
        session.user.user_metadata?.email ||
        "User"

      setUser(identifier)
      setLoading(false)
    }

    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session || !session.user) {
          router.push('/')
        } else {
          const identifier =
            session.user.email ||
            session.user.user_metadata?.email ||
            "User"
          setUser(identifier)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [router])

  const input = async () => {
    if (!obj) {
      setMsg('Write something first')
      return
    }

    setMsg('Thinking...')

    const updatedConversation = [
      ...conversation,
      { role: "user", content: obj }
    ]
    setConversation(updatedConversation)
    setObj('')

    try {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedConversation
        }),
      })

      const result = await resp.json()
      const reply = result?.choices?.[0]?.message?.content || 'Error'

      setConversation(prev => [...prev, { role: "assistant", content: reply }])
      setMsg('')
    } catch (err) {
      setMsg('Error')
    }
  }

  if (loading) return <p>Loading...</p>

  return (
    <main>
      <div>
        <h1>Welcome, {user}</h1>
        <LogoutButton />
      </div>

      <div>
        <div style={{whiteSpace: 'pre-wrap'}}>
          {conversation.map((c, i) => (
            <p key={i}><b>{c.role}:</b> {c.content}</p>
          ))}
        </div>

        <input
          type="text"
          placeholder="How can I help you?"
          value={obj}
          onChange={(e) => setObj(e.target.value)}
        />
        <button onClick={input}>Send</button>

        {msg && <p>{msg}</p>}
      </div>
    </main>
  )
}
