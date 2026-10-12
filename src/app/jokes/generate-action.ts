'use server'

import { createClient as createServerClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function generateJoke(topic: string) {
  const authClient = await createServerClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to generate jokes.' }
  }

  if (!process.env.GEMINI_API_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { error: 'Server is missing an API key.' }
  }

  const subject = topic.trim().slice(0, 100) || 'anything at all'
  const prompt = `Write one short, original, clean joke about: ${subject}. Reply with only the joke itself in 1-2 sentences. No title, no explanation.`

  const models = Array.from(
    new Set(
      [
        process.env.GEMINI_MODEL,
        'gemini-3.5-flash',
        'gemini-3.1-flash-lite',
        'gemini-flash-latest',
      ].filter(Boolean)
    )
  ) as string[]

  let text = ''
  let lastStatus = 0

  for (let pass = 0; pass < 2 && !text; pass++) {
    if (pass > 0) await sleep(2000)

    for (const model of models) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': process.env.GEMINI_API_KEY,
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 1, maxOutputTokens: 1024 },
            }),
            signal: AbortSignal.timeout(15000),
          }
        )
        lastStatus = res.status

        if (res.ok) {
          const data = await res.json()
          text = (
            data?.candidates?.[0]?.content?.parts
              ?.map((p: { text?: string }) => p.text ?? '')
              .join('') ?? ''
          ).trim()
          if (text) break
          continue
        }

        console.error('Gemini error', model, res.status)
        if ([400, 401, 403].includes(res.status)) {
          return { error: 'Gemini rejected the API key. Check GEMINI_API_KEY.' }
        }
      } catch (e) {
        console.error('Gemini fetch failed', model, (e as Error).name)
      }
    }
  }

  if (!text) {
    return {
      error: `Gemini is overloaded right now${lastStatus ? ` (${lastStatus})` : ''}. Please try again in a minute.`,
    }
  }

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  const { error } = await admin.from('jokes').insert({ text, author: 'Gemini' })

  if (error) {
    console.error('Supabase insert error', error.message)
    return { error: error.message }
  }

  revalidatePath('/jokes')
  return { success: true }
}
