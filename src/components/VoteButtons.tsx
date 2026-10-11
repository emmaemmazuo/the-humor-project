'use client'

import { useState, useTransition } from 'react'
import { submitVote } from '@/app/jokes/actions'

type Vote = 'up' | 'down' | null

export default function VoteButtons({
  captionId,
  isLoggedIn,
  userVote,
}: {
  captionId: number
  isLoggedIn: boolean
  userVote: Vote
}) {
  const [isPending, startTransition] = useTransition()
  const [myVote, setMyVote] = useState<Vote>(userVote)
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
        setMyVote(voteType)
        setMessage(null)
      }
    })
  }

  const hasVoted = myVote !== null
  const base = 'px-3 py-1 rounded border disabled:cursor-not-allowed'

  return (
    <div className="mt-3 flex items-center gap-3">
      <button
        onClick={() => handleVote('up')}
        disabled={isPending || hasVoted}
        className={`${base} ${
          myVote === 'up'
            ? 'bg-green-100 border-green-500'
            : 'hover:bg-gray-100 disabled:opacity-50'
        }`}
      >
        👍 Upvote
      </button>
      <button
        onClick={() => handleVote('down')}
        disabled={isPending || hasVoted}
        className={`${base} ${
          myVote === 'down'
            ? 'bg-red-100 border-red-500'
            : 'hover:bg-gray-100 disabled:opacity-50'
        }`}
      >
        👎 Downvote
      </button>
      {hasVoted && (
        <span className="text-sm text-gray-500">
          You {myVote === 'up' ? 'upvoted' : 'downvoted'} this
        </span>
      )}
      {message && <span className="text-sm text-red-600">{message}</span>}
    </div>
  )
}
