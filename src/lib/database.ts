import { supabase } from './supabase'
import type { Database } from './supabase'

// Type definitions
type User = Database['public']['Tables']['users']['Row']
type UserInsert = Database['public']['Tables']['users']['Insert']
type UserUpdate = Database['public']['Tables']['users']['Update']

type Room = Database['public']['Tables']['rooms']['Row']
type RoomInsert = Database['public']['Tables']['rooms']['Insert']
type RoomUpdate = Database['public']['Tables']['rooms']['Update']

type RoomParticipant = Database['public']['Tables']['room_participants']['Row']
type RoomParticipantInsert = Database['public']['Tables']['room_participants']['Insert']

type Game = Database['public']['Tables']['games']['Row']
type GameInsert = Database['public']['Tables']['games']['Insert']
type GameUpdate = Database['public']['Tables']['games']['Update']

type Submission = Database['public']['Tables']['submissions']['Row']
type SubmissionInsert = Database['public']['Tables']['submissions']['Insert']

type Vote = Database['public']['Tables']['votes']['Row']
type VoteInsert = Database['public']['Tables']['votes']['Insert']

// User Operations
export async function createOrUpdateUser(address: string, displayName: string, avatarUrl?: string) {
  const { data, error } = await supabase
    .from('users')
    .upsert({
      address,
      display_name: displayName,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'address'
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getUserByAddress(address: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('address', address)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

// Room Operations
export async function createRoom(roomData: Omit<RoomInsert, 'code'>) {
  const code = generateRoomCode()
  
  const { data, error } = await supabase
    .from('rooms')
    .insert({
      ...roomData,
      code,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getRoomByCode(code: string) {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('code', code)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function getRoomById(id: string) {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', id)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function updateRoomStatus(id: string, status: Room['status']) {
  const { data, error } = await supabase
    .from('rooms')
    .update({ 
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getPublicRooms() {
  const { data, error } = await supabase
    .from('rooms')
    .select(`
      *,
      room_participants(count)
    `)
    .eq('is_public', true)
    .in('status', ['waiting', 'starting'])
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Room Participant Operations
export async function joinRoom(roomId: string, userAddress: string) {
  // Check if room exists and has space
  const room = await getRoomById(roomId)
  if (!room) throw new Error('Room not found')
  
  const participantCount = await getRoomParticipantCount(roomId)
  if (participantCount >= room.max_players) throw new Error('Room is full')

  // Check if user is already in room
  const existingParticipant = await supabase
    .from('room_participants')
    .select('*')
    .eq('room_id', roomId)
    .eq('user_address', userAddress)
    .eq('status', 'active')
    .single()

  if (existingParticipant.data) {
    return existingParticipant.data
  }

  const { data, error } = await supabase
    .from('room_participants')
    .insert({
      room_id: roomId,
      user_address: userAddress,
      status: 'active',
      joined_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function leaveRoom(roomId: string, userAddress: string) {
  const { data, error } = await supabase
    .from('room_participants')
    .update({ status: 'left' })
    .eq('room_id', roomId)
    .eq('user_address', userAddress)
    .eq('status', 'active')
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getRoomParticipants(roomId: string) {
  const { data, error } = await supabase
    .from('room_participants')
    .select(`
      *,
      users!inner(address, display_name, avatar_url)
    `)
    .eq('room_id', roomId)
    .eq('status', 'active')

  if (error) throw error
  return data
}

export async function getRoomParticipantCount(roomId: string) {
  const { count, error } = await supabase
    .from('room_participants')
    .select('*', { count: 'exact', head: true })
    .eq('room_id', roomId)
    .eq('status', 'active')

  if (error) throw error
  return count || 0
}

// Game Operations
export async function createGame(roomId: string, prompt?: string, timeLimit?: number) {
  const { data, error } = await supabase
    .from('games')
    .insert({
      room_id: roomId,
      prompt,
      time_limit: timeLimit,
      status: 'drawing',
      started_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getGameByRoomId(roomId: string) {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('room_id', roomId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function updateGameStatus(gameId: string, status: Game['status']) {
  const { data, error } = await supabase
    .from('games')
    .update({ 
      status,
      updated_at: new Date().toISOString(),
      ...(status === 'completed' && { ended_at: new Date().toISOString() })
    })
    .eq('id', gameId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Submission Operations
export async function submitDrawing(gameId: string, userAddress: string, drawingData: string, description: string) {
  const { data, error } = await supabase
    .from('submissions')
    .insert({
      game_id: gameId,
      user_address: userAddress,
      drawing_data: drawingData,
      description,
      submitted_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateSubmissionScore(
  submissionId: string, 
  score: number, 
  feedback: string, 
  criteria: {
    accuracy: number
    creativity: number
    technique: number
    completeness: number
  }
) {
  const { data, error } = await supabase
    .from('submissions')
    .update({
      ai_score: score,
      ai_feedback: feedback,
      ai_criteria: criteria,
      scored_at: new Date().toISOString()
    })
    .eq('id', submissionId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getSubmissionsByGameId(gameId: string) {
  const { data, error } = await supabase
    .from('submissions')
    .select(`
      *,
      users!inner(address, display_name, avatar_url)
    `)
    .eq('game_id', gameId)
    .order('submitted_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getUserSubmission(gameId: string, userAddress: string) {
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('game_id', gameId)
    .eq('user_address', userAddress)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

// Vote Operations
export async function voteForSubmission(gameId: string, voterAddress: string, submissionId: string) {
  // Check if user already voted in this game
  const existingVote = await supabase
    .from('votes')
    .select('*')
    .eq('game_id', gameId)
    .eq('voter_address', voterAddress)
    .single()

  if (existingVote.data) {
    throw new Error('User has already voted in this game')
  }

  const { data, error } = await supabase
    .from('votes')
    .insert({
      game_id: gameId,
      voter_address: voterAddress,
      submission_id: submissionId,
      voted_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getVotesByGameId(gameId: string) {
  const { data, error } = await supabase
    .from('votes')
    .select('*')
    .eq('game_id', gameId)

  if (error) throw error
  return data
}

// Utility Functions
function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

// Real-time subscriptions
export function subscribeToRoomUpdates(roomId: string, callback: (payload: any) => void) {
  return supabase
    .channel(`room-${roomId}`)
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'room_participants',
        filter: `room_id=eq.${roomId}`
      }, 
      callback
    )
    .on('postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'rooms',
        filter: `id=eq.${roomId}`
      },
      callback
    )
    .subscribe()
}

export function subscribeToGameUpdates(gameId: string, callback: (payload: any) => void) {
  return supabase
    .channel(`game-${gameId}`)
    .on('postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'submissions',
        filter: `game_id=eq.${gameId}`
      },
      callback
    )
    .on('postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'games',
        filter: `id=eq.${gameId}`
      },
      callback
    )
    .subscribe()
}
