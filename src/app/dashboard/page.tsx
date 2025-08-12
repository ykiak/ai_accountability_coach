'use client'
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import LogoutButton from "@/components/LogoutButton"
import Link from "next/link"

export default function Dashboard() {
  const [user, setUser] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [conversation, setConversation] = useState<{ role: string, content: string }[]>([])
  const [obj, setObj] = useState('')
  const [msg, setMsg] = useState('')
  const router = useRouter()

  useEffect(() => {
    const saved = localStorage.getItem("conversation");
    if (saved) {
      try {
        setConversation(JSON.parse(saved));
      } catch {
        localStorage.removeItem("conversation");
      }
    }
  }, []);

  useEffect(() => {
    if (conversation.length > 0) {
      localStorage.setItem("conversation", JSON.stringify(conversation));
    }
  }, [conversation]);

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
      setUserId(session.user.id)
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
          setUserId(session.user.id)
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
          messages: updatedConversation,
          user_id: userId
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

  const clearConversation = () =>{
    setConversation([])
    localStorage.removeItem('conversation')
    setMsg('Conversation cleared')
  }

  if (loading) return <p>Loading...</p>

  return (
    <main>
      <div>
        <h1>Welcome, {user}</h1>
        <LogoutButton />
        <br></br>
        <Link href={'/habits'}>Set goals</Link>
        <br></br>
        <Link href={'/profile'}>Profile</Link>
      </div>

      <div>
        <div style={{ whiteSpace: 'pre-wrap' }}>
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
        <br></br>
        <button onClick={clearConversation}>Clear chat</button>

        {msg && <p>{msg}</p>}
      </div>
    </main>
  )
}
