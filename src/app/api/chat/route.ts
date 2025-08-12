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

    const { data: habits, error: habitsError } = await supabase
      .from('user_habits')
      .select('*')
      .eq('user_id', user_id)

    if (habitsError) {
      console.error('Erro ao buscar hábitos:', habitsError)
    }

    const habitsText =
      habits && habits.length > 0
        ? habits.map(h => `${h.habit_type}: ${h.description}`).join('; ')
        : 'Nenhum hábito registrado ainda.'

    const systemMessage = {
      role: 'system',
      content: `Você é um coach que ajuda pessoas a manter hábitos saudáveis.
      Hábitos conhecidos: ${habitsText}.
      Sempre personalize suas respostas levando em conta esses hábitos.`
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
