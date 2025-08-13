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

  if (loading) return <p className="text-center mt-20 text-blue-700 font-semibold">Loading...</p>

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#3432c7] to-[#000000] p-6 font-sans flex justify-center">
      <section className="bg-white rounded-lg shadow p-6 flex flex-col gap-4 w-full max-w-3xl mx-4">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-blue-800">Welcome, {user}</h1>
          <LogoutButton />
        </header>

        <nav className="flex gap-6 mb-8 text-blue-700 font-semibold">
          <Link href="/habits" className="hover:underline">Set goals</Link>
          <Link href="/profile" className="hover:underline">Profile</Link>
        </nav>

        <div className="h-64 overflow-y-auto border border-gray-300 rounded p-4 bg-gray-100 whitespace-pre-wrap">
          {conversation.length === 0 ? (
            <p className="text-gray-500 italic text-center mt-20">No messages yet. Start the conversation!</p>
          ) : (
            conversation.map((c, i) => (
              <p key={i} className={`mb-3 ${c.role === 'user' ? 'text-blue-700' : 'text-gray-800'}`}>
                <b className="capitalize">{c.role}:</b> {c.content}
              </p>
            ))
          )}
        </div>

        <div className="flex gap-3 mt-2">
          <input
            type="text"
            placeholder="How can I help you?"
            value={obj}
            onChange={(e) => setObj(e.target.value)}
            className="flex-grow px-4 py-3 border border-gray-400 rounded shadow-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
          />
          <button
            onClick={input}
            className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded font-semibold transition disabled:opacity-50"
            disabled={!obj.trim()}
          >
            Send
          </button>
        </div>

        <button
          onClick={clearConversation}
          className="mt-3 self-start text-sm text-red-600 hover:underline font-medium"
        >
          Clear chat
        </button>

        {msg && (
          <p className="mt-4 text-center text-sm text-red-600 font-medium">{msg}</p>
        )}
      </section>
    </main>
  )
}
