'use client'
import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import Link from "next/link"
import Animated_icon from "@/components/Animated_icon"

export default function Register(){
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [msg, setMsg] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleRegister = async (e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const {error} = await supabase.auth.signUp({email, password})
        setLoading(false)
        if (error) setMsg('Error: ' + error.message)
            else{
                setMsg('Registration completed')
                setTimeout(()=>router.push('/'), 2000)
            }
    }
    return(
        <div className="min-h-screen flex font-sans">
            <div className="w-1/2 bg-gradient-to-b from-[#000000] to-[#3432c7] text-white flex flex-col justify-center items-center">
            <Animated_icon/>
                <h1 className="text-5xl font-bold mt-12">ETC. INC</h1>
            </div>

            <div className="w-1/2 bg-gray-100 flex flex-col justify-center items-center p-8">
                <h2 className="text-3xl font-extrabold text-blue-700 mb-1">Create your account</h2>
                <p className="text-md text-blue-600 mb-6">Sign up to get started</p>

                <form onSubmit={handleRegister} className="w-full max-w-sm space-y-4">
                    <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e)=>setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-400 rounded shadow-sm text-black"
                    />
                    <input 
                        type="password"
                        placeholder="********"
                        value={password}
                        onChange={(e)=>setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-400 rounded shadow-sm text-black"
                    />
                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded font-semibold"
                    >
                        {loading ? "Signing Up..." : "Sign Up"}
                    </button>
                </form>

                {msg && (
                    <p className="mt-4 text-center text-sm text-red-600 font-medium">
                        {msg}
                    </p>
                )}

                <div className="mt-6 text-sm text-center">
                    <Link href='/' className="text-blue-700 hover:underline">
                        Return to Login
                    </Link>
                </div>
            </div>
        </div>
    )
}
