import { NextRequest, NextResponse } from 'next/server'
import { createGame, getGameByRoomId } from '~/lib/database'
import { verifyAuth } from '~/lib/auth'

// POST /api/games - Create a new game
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user } = authResult

    const body = await request.json()
    const { roomId, prompt, timeLimit } = body

    if (!roomId) {
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      )
    }

    const game = await createGame(roomId, prompt, timeLimit)

    return NextResponse.json({ game }, { status: 201 })
  } catch (error) {
    console.error('Error creating game:', error)
    return NextResponse.json(
      { error: 'Failed to create game' },
      { status: 500 }
    )
  }
}

// GET /api/games?roomId=xxx - Get game by room ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId')

    if (!roomId) {
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      )
    }

    const game = await getGameByRoomId(roomId)
    
    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ game })
  } catch (error) {
    console.error('Error fetching game:', error)
    return NextResponse.json(
      { error: 'Failed to fetch game' },
      { status: 500 }
    )
  }
}
