import { supabase } from '@/lib/supabase'

export default async function JokesPage() {
  const { data: jokes, error } = await supabase
    .from('jokes')
    .select('*')

  if (error) {
    return <div className="p-8">Error loading jokes: {error.message}</div>
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Jokes</h1>
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
