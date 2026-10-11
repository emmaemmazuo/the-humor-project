import { redirect } from 'next/navigation'
import { createClient as createServerClient } from '@/utils/supabase/server'
import { supabase } from '@/lib/supabase'
import VoteButtons from '@/components/VoteButtons'

export default async function JokesPage() {
  const authClient = await createServerClient()

  const {
    data: { user },
  } = await authClient.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: jokes, error } = await supabase.from('jokes').select('*')

  if (error) {
    return <div className="p-8">Error loading jokes: {error.message}</div>
  }

  const { data: votes } = await supabase
    .from('caption_votes')
    .select('caption_id, vote_type')

  const upvoteCounts: Record<number, number> = {}
  votes?.forEach((v) => {
    if (v.vote_type === 'up') {
      upvoteCounts[v.caption_id] = (upvoteCounts[v.caption_id] || 0) + 1
    }
  })

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Jokes</h1>
        <span className="text-sm text-gray-500">{user.email}</span>
      </div>
      <ul className="space-y-4">
        {jokes?.map((joke) => (
          <li key={joke.id} className="border rounded-lg p-4 shadow-sm">
            <p className="text-lg">{joke.text}</p>
            {joke.author && (
              <p className="text-sm text-gray-500 mt-2">— {joke.author}</p>
            )}
            <p className="text-sm text-gray-600 mt-2">
              {upvoteCounts[joke.id] || 0} upvote
              {upvoteCounts[joke.id] === 1 ? '' : 's'}
            </p>
            <VoteButtons captionId={joke.id} isLoggedIn={!!user} />
          </li>
        ))}
      </ul>
    </div>
  )
}
