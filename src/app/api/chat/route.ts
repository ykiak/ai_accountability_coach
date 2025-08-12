import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function POST(req: NextRequest) {
  try {
    const { messages, user_id } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      )
    }

    if (!user_id) {
      return NextResponse.json(
        { error: 'Missing user_id' },
        { status: 400 }
      )
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('name, birth_date, height_cm, weight_kg, bio')
      .eq('user_id', user_id)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
    }

    const { data: habits, error: habitsError } = await supabase
      .from('user_habits')
      .select('*')
      .eq('user_id', user_id)

    if (habitsError) {
      console.error('Error fetching habits:', habitsError)
    }

    const habitsText =
      habits && habits.length > 0
        ? habits.map(h => `${h.habit_type}: ${h.description}`).join('; ')
        : 'No habits registered yet.'

    const profileText = profile
      ? `Name: ${profile.name || 'Not provided'}.
         Birth date: ${profile.birth_date || 'Not provided'}.
         Height: ${profile.height_cm ? profile.height_cm + ' cm' : 'Not provided'}.
         Weight: ${profile.weight_kg ? profile.weight_kg + ' kg' : 'Not provided'}.
         Bio: ${profile.bio || 'Not provided'}.`
      : 'No profile information available.'

    const systemMessage = {
      role: 'system',
      content: `You are a personal health and habits coach.
      User profile: ${profileText}
      Known habits: ${habitsText}
      Always personalize your responses considering this information.`
    }

    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3-70b-8192',
          messages: [
            systemMessage,
            ...messages
          ],
          temperature: 0.7,
        }),
      }
    )

    const data = await response.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
