'use client'
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import LogoutButton from "@/components/LogoutButton"

export default function Dashboard() {
  const [user, setUser] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [res, setRes] = useState('')
  const [obj, setObj] = useState('')
  const [msg, setMsg] = useState('')
  const router = useState('')

  useEffect(() => {
    let mounted = true

    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (!mounted) return

      if (error || !session || !session.user) {
        router.push('/')
        return
      }

      const currentUser = session.user
      const identifier =
        currentUser.email ||
        currentUser.user_metadata?.email ||
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
    if(!obj){
      setMsg('Write something first')
      return
    }
    setMsg('Thinking')
    setRes('')

    const prompt = `Help the user with this: "${obj}"`

    try{
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({prompt}),
      })
      const result = await resp.json()

      if(result?.choices?.[0]?.message?.content){
        setRes(result.choices[0].message.content)
        setMsg('')
        setObj('')
      }else{
        setMsg('Error 1')
      }
      }catch(err){
        setMsg('Error 2')
    }
  }

  const newChat = () => {
    setRes('')
    setMsg('')
    setObj('')
  }

  if (loading) return <p>Loading...</p>

  return (
    <main>
    <div>
      <h1>Welcome, {user}</h1>
      <LogoutButton />
    </div>
    <div>
        <input
        type="text"
        placeholder="How can I help you?"
        value={obj}
        onChange={(e) => setObj(e.target.value)}
        />
        <button onClick={input}>Generate</button>

        {msg && <p>{msg}</p>}
        {res && (
          <div>
            <pre>{res}</pre>
            <button onClick={newChat}>Try again</button>
          </div>
        )}
    </div>
    </main>
  )
}
