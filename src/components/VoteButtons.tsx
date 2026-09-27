'use client'

import { useState, useTransition } from 'react'
import { submitVote } from '@/app/jokes/actions'

export default function VoteButtons({
  captionId,
  isLoggedIn,
}: {
  captionId: number
  isLoggedIn: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)

  const handleVote = (voteType: 'up' | 'down') => {
    if (!isLoggedIn) {
      setMessage('Sign in to vote.')
      return
    }
    startTransition(async () => {
      const result = await submitVote(captionId, voteType)
      if (result.error) {
        setMessage(result.error)
      } else {
        setMessage(voteType === 'up' ? 'Upvoted!' : 'Downvoted!')
      }
    })
  }

  return (
    <div className="mt-3 flex items-center gap-3">
      <button
        onClick={() => handleVote('up')}
        disabled={isPending}
        className="px-3 py-1 rounded border hover:bg-gray-100 disabled:opacity-50"
      >
        👍 Upvote
      </button>
      <button
        onClick={() => handleVote('down')}
        disabled={isPending}
        className="px-3 py-1 rounded border hover:bg-gray-100 disabled:opacity-50"
      >
        👎 Downvote
      </button>
      {message && <span className="text-sm text-gray-500">{message}</span>}
    </div>
  )
}
