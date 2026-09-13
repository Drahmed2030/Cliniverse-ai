import type { SupabaseClient } from '@supabase/supabase-js'
import { restoreHandover, type HandoverCheckpoint } from './handoverCheckpoint.ts'
const columns='user_id,session_id,checkpoint,content_version,actions'
export function handoverAccountRepository(client:SupabaseClient) {
  async function identity(owner:string) {
    const {data,error}=await client.auth.getUser()
    if(error || data.user?.id!==owner)throw Error('Account changed')
  }
  return {
    async latest(owner:string) {
      await identity(owner)
      const {data,error}=await client.from('ward_practice_checkpoints').select(columns).eq('user_id',owner).order('created_at',{ascending:false}).limit(1)
      if(error)throw Error('History unavailable')
      await identity(owner)
      const row=data?.[0] as HandoverCheckpoint | undefined
      if(row)restoreHandover(owner,row)
      return row ?? null
    },
    async save(owner:string,row:HandoverCheckpoint) {
      restoreHandover(owner,row); await identity(owner)
      const {error}=await client.from('ward_practice_checkpoints').insert(row)
      if(error && error.code!=='23505')throw Error('Save unavailable')
      const {data,error:readError}=await client.from('ward_practice_checkpoints').select(columns).eq('user_id',owner).eq('session_id',row.session_id).eq('checkpoint',row.checkpoint).single()
      await identity(owner)
      if(readError || !data)throw Error('Save not verified')
      const stored=data as HandoverCheckpoint
      restoreHandover(owner,stored)
      if(stored.content_version!==row.content_version || JSON.stringify(stored.actions.map(({action,at})=>({action,at})))!==JSON.stringify(row.actions))throw Error('Session conflict; reload before continuing')
    },
  }
}
