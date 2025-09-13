import { NextRequest, NextResponse } from 'next/server'
import { getRoomByCode, updateRoomStatus } from '~/lib/database'
import { verifyAuth } from '~/lib/auth'

// GET /api/rooms/[code] - Get room by code
export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const room = await getRoomByCode(params.code)
    
    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ room })
  } catch (error) {
    console.error('Error fetching room:', error)
    return NextResponse.json(
      { error: 'Failed to fetch room' },
      { status: 500 }
    )
  }
}

// PATCH /api/rooms/[code] - Update room status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user } = authResult

    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    const room = await getRoomByCode(params.code)
    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    // Only room host can update status
    if (room.host_address !== user.address) {
      return NextResponse.json(
        { error: 'Only room host can update status' },
        { status: 403 }
      )
    }

    const updatedRoom = await updateRoomStatus(room.id, status)
    return NextResponse.json({ room: updatedRoom })
  } catch (error) {
    console.error('Error updating room:', error)
    return NextResponse.json(
      { error: 'Failed to update room' },
      { status: 500 }
    )
  }
}
