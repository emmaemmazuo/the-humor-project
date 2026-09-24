import { redirect } from 'next/navigation'
import { createClient as createServerClient } from '@/utils/supabase/server'
import { supabase } from '@/lib/supabase'

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
          </li>
        ))}
      </ul>
    </div>
  )
}
