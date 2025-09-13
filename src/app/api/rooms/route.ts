import { NextRequest, NextResponse } from 'next/server'
import { createRoom, getPublicRooms } from '~/lib/database'
import { verifyAuth } from '~/lib/auth'

// GET /api/rooms - Get all public rooms
export async function GET() {
  try {
    const rooms = await getPublicRooms()
    return NextResponse.json({ rooms })
  } catch (error) {
    console.error('Error fetching public rooms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch public rooms' },
      { status: 500 }
    )
  }
}

// POST /api/rooms - Create a new room
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, theme, maxPlayers = 8, timeLimit, isPublic = false } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Room name is required' },
        { status: 400 }
      )
    }

    const room = await createRoom({
      name,
      theme,
      max_players: maxPlayers,
      time_limit: timeLimit,
      is_public: isPublic,
      host_address: authResult.address,
      status: 'waiting'
    })

    return NextResponse.json({ room }, { status: 201 })
  } catch (error) {
    console.error('Error creating room:', error)
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    )
  }
}
