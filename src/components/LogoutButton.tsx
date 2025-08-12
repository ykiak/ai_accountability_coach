'use client'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {  
  const router = useRouter()

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      alert('Error: ' + error.message)
    } else {
      router.push('/') 
    }
  }

  return (
    <button onClick={handleLogout}>Exit</button>
  )
}