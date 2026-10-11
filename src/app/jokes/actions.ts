'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitVote(captionId: number, voteType: 'up' | 'down') {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to vote.' }
  }

  const { data: existing } = await supabase
    .from('caption_votes')
    .select('id')
    .eq('user_id', user.id)
    .eq('caption_id', captionId)
    .limit(1)

  if (existing && existing.length > 0) {
    return { error: 'You already voted on this joke.' }
  }

  const { error } = await supabase.from('caption_votes').insert({
    user_id: user.id,
    caption_id: captionId,
    vote_type: voteType,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/jokes')
  return { success: true }
}
