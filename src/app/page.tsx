'use client'

import { useState, useEffect} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const router = useRouter()

  useEffect(()=>{
    const checkIfLoggedIn = async ()=> {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.replace('/dashboard')
         }
    } 
    checkIfLoggedIn()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace('/dashboard')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const handleLogin = async (e:React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault()
    const {error} = await supabase.auth.signInWithPassword({email, password})
    if (error) setMsg('Error: ' + error.message)
      else{
        setMsg('Login successful')
        setTimeout(()=>router.push('/dashboard'), 2000)
      }
  }
  return(
    <div>
      <form onSubmit={handleLogin}>
        <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        />
        <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">
          Sign In
        </button>
        {msg && <p>{msg}</p>}
      </form>
      <Link href={'/register'}>Don't have an account? Sign Up</Link>
    </div>
  )
}