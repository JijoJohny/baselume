import { NextRequest, NextResponse } from 'next/server'
import { getRoomByCode, joinRoom, getRoomParticipants } from '~/lib/database'
import { verifyAuth } from '~/lib/auth'

// POST /api/rooms/[code]/join - Join a room
export async function POST(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user } = authResult

    const room = await getRoomByCode(params.code)
    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    if (room.status !== 'waiting' && room.status !== 'starting') {
      return NextResponse.json(
        { error: 'Room is not accepting new players' },
        { status: 400 }
      )
    }

    const participant = await joinRoom(room.id, user.address)
    const participants = await getRoomParticipants(room.id)

    return NextResponse.json({ 
      participant,
      participants,
      room 
    })
  } catch (error) {
    console.error('Error joining room:', error)
    
    if (error instanceof Error) {
      if (error.message === 'Room is full') {
        return NextResponse.json(
          { error: 'Room is full' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to join room' },
      { status: 500 }
    )
  }
}
