'use client'
import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import Link from "next/link"

export default function Register(){
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [msg, setMsg] = useState('')
    const router = useRouter()

    const handleRegister = async (e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const {error} = await supabase.auth.signUp({email, password})
        if (error) setMsg('Error: ' + error.message)
            else{
                setMsg('Registration completed')
                setTimeout(()=>router.push('/'), 2000)
            }
    }
    return(
        <div>
            <form onSubmit={handleRegister}>
                <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                />
                <input 
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                />
                <button type="submit">Sign Up</button>
                {msg && <p>{msg}</p>}
            </form>
            <Link href={'/'}>Return to Login</Link>
        </div>
    )
}