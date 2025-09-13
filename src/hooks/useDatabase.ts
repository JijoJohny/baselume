import { useState, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { fetchWithAuth } from '~/lib/auth'

// Types
interface Room {
  id: string
  name: string
  code: string
  host_address: string
  theme?: string
  max_players: number
  status: 'waiting' | 'starting' | 'in_progress' | 'completed'
  is_public: boolean
  time_limit?: number
  created_at: string
  updated_at: string
  participant_count?: number
}

interface User {
  id: string
  address: string
  display_name: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

interface Game {
  id: string
  room_id: string
  status: 'waiting' | 'drawing' | 'voting' | 'completed'
  prompt?: string
  time_limit?: number
  started_at?: string
  ended_at?: string
  created_at: string
  updated_at: string
}

interface Submission {
  id: string
  game_id: string
  user_address: string
  drawing_data: string
  description: string
  submitted_at: string
  users?: User
}

// Custom hook for database operations
export function useDatabase() {
  const { address } = useAccount()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Clear error after a delay
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  // Create or update user profile
  const createOrUpdateUser = useCallback(async (displayName: string, avatarUrl?: string) => {
    if (!address) throw new Error('No wallet connected')

    setLoading(true)
    setError(null)

    try {
      const response = await fetchWithAuth('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          displayName,
          avatarUrl
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create/update user')
      }

      const data = await response.json()
      return data.user
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [address])

  // Create a new room
  const createRoom = useCallback(async (roomData: {
    name: string
    host_address: string
    theme?: string
    max_players?: number
    time_limit?: number
    is_public?: boolean
    status?: 'waiting' | 'starting' | 'in_progress' | 'completed'
  }) => {
    if (!address) throw new Error('No wallet connected')

    setLoading(true)
    setError(null)

    try {
      const response = await fetchWithAuth('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roomData)
      })

      if (!response.ok) {
        throw new Error('Failed to create room')
      }

      const data = await response.json()
      return data.room
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [address])

  // Get public rooms
  const getPublicRooms = useCallback(async (): Promise<Room[]> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/rooms')
      
      if (!response.ok) {
        throw new Error('Failed to fetch public rooms')
      }

      const data = await response.json()
      return data.rooms || []
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Join a room
  const joinRoom = useCallback(async (roomCode: string) => {
    if (!address) throw new Error('No wallet connected')

    setLoading(true)
    setError(null)

    try {
      const response = await fetchWithAuth(`/api/rooms/${roomCode}/join`, {
        method: 'POST'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to join room')
      }

      const data = await response.json()
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [address])

  // Create a new game
  const createGame = useCallback(async (roomId: string, prompt?: string, timeLimit?: number) => {
    if (!address) throw new Error('No wallet connected')

    setLoading(true)
    setError(null)

    try {
      const response = await fetchWithAuth('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId,
          prompt,
          timeLimit
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create game')
      }

      const data = await response.json()
      return data.game
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [address])

  // Submit a drawing
  const submitDrawing = useCallback(async (gameId: string, drawingData: string, description: string) => {
    if (!address) throw new Error('No wallet connected')

    setLoading(true)
    setError(null)

    try {
      const response = await fetchWithAuth('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId,
          drawingData,
          description
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit drawing')
      }

      const data = await response.json()
      return data.submission
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [address])

  // Get submissions for a game
  const getSubmissions = useCallback(async (gameId: string): Promise<Submission[]> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/submissions?gameId=${gameId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch submissions')
      }

      const data = await response.json()
      return data.submissions || []
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    createOrUpdateUser,
    createRoom,
    getPublicRooms,
    joinRoom,
    createGame,
    submitDrawing,
    getSubmissions
  }
}
