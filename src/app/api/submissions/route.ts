import { NextRequest, NextResponse } from 'next/server'
import { submitDrawing, getSubmissionsByGameId, updateSubmissionScore, getGameByRoomId, getRoomById } from '~/lib/database'
import { verifyAuth } from '~/lib/auth'
import { scoreDrawing } from '~/lib/gemini'

// POST /api/submissions - Submit a drawing
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { gameId, drawingData, description } = body

    if (!gameId || !drawingData || !description) {
      return NextResponse.json(
        { error: 'Game ID, drawing data, and description are required' },
        { status: 400 }
      )
    }

    const submission = await submitDrawing(gameId, authResult.address, drawingData, description)

    // Score the drawing asynchronously with AI
    try {
      // Get game and room info for context
      const { supabase } = await import('~/lib/supabase')
      const { data: game } = await supabase
        .from('games')
        .select(`
          *,
          rooms!inner(theme)
        `)
        .eq('id', gameId)
        .single()

      if (game) {
        const aiResult = await scoreDrawing(drawingData, description, game.rooms.theme)
        
        // Update submission with AI score
        await updateSubmissionScore(
          submission.id,
          aiResult.score,
          aiResult.feedback,
          aiResult.criteria
        )

        // Return submission with score
        return NextResponse.json({ 
          submission: {
            ...submission,
            ai_score: aiResult.score,
            ai_feedback: aiResult.feedback,
            ai_criteria: aiResult.criteria,
            scored_at: new Date().toISOString()
          }
        }, { status: 201 })
      }
    } catch (scoringError) {
      console.error('AI scoring failed:', scoringError)
      // Continue without scoring - submission is still valid
    }

    return NextResponse.json({ submission }, { status: 201 })
  } catch (error) {
    console.error('Error submitting drawing:', error)
    return NextResponse.json(
      { error: 'Failed to submit drawing' },
      { status: 500 }
    )
  }
}

// GET /api/submissions?gameId=xxx - Get submissions for a game
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const gameId = searchParams.get('gameId')

    if (!gameId) {
      return NextResponse.json(
        { error: 'Game ID is required' },
        { status: 400 }
      )
    }

    const submissions = await getSubmissionsByGameId(gameId)

    return NextResponse.json({ submissions })
  } catch (error) {
    console.error('Error fetching submissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    )
  }
}
