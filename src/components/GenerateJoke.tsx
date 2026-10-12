'use client'

import { useState, useTransition } from 'react'
import { generateJoke } from '@/app/jokes/generate-action'

export default function GenerateJoke() {
  const [topic, setTopic] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleGenerate = () => {
    setError(null)
    startTransition(async () => {
      const result = await generateJoke(topic)
      if (result.error) {
        setError(result.error)
      } else {
        setTopic('')
      }
    })
  }

  return (
    <div className="mb-6 border rounded-lg p-4 bg-purple-50">
      <p className="font-semibold mb-2">✨ Generate a joke with Gemini</p>
      <div className="flex gap-2">
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !isPending && handleGenerate()}
          placeholder="Pick a topic (or leave blank)"
          maxLength={100}
          className="flex-1 border rounded px-3 py-2 bg-white"
        />
        <button
          onClick={handleGenerate}
          disabled={isPending}
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
        >
          {isPending ? 'Generating…' : 'Generate'}
        </button>
      </div>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  )
}
