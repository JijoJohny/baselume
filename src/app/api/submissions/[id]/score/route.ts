import { NextRequest, NextResponse } from 'next/server'
import { updateSubmissionScore } from '~/lib/database'
import { scoreDrawing } from '~/lib/gemini'
import { supabase } from '~/lib/supabase'

// POST /api/submissions/[id]/score - Score a submission manually
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const submissionId = params.id

    // Get submission with game and room data
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .select(`
        *,
        games!inner(
          *,
          rooms!inner(theme)
        )
      `)
      .eq('id', submissionId)
      .single()

    if (submissionError || !submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      )
    }

    // Score the drawing with AI
    const aiResult = await scoreDrawing(
      submission.drawing_data,
      submission.description,
      submission.games.rooms.theme
    )

    // Update submission with AI score
    const updatedSubmission = await updateSubmissionScore(
      submissionId,
      aiResult.score,
      aiResult.feedback,
      aiResult.criteria
    )

    return NextResponse.json({
      submission: {
        ...updatedSubmission,
        ai_score: aiResult.score,
        ai_feedback: aiResult.feedback,
        ai_criteria: aiResult.criteria
      },
      scoring_result: aiResult
    })
  } catch (error) {
    console.error('Error scoring submission:', error)
    return NextResponse.json(
      { error: 'Failed to score submission' },
      { status: 500 }
    )
  }
}

// GET /api/submissions/[id]/score - Get submission score
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const submissionId = params.id

    const { data: submission, error } = await supabase
      .from('submissions')
      .select('id, ai_score, ai_feedback, ai_criteria, scored_at')
      .eq('id', submissionId)
      .single()

    if (error || !submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      score: submission.ai_score,
      feedback: submission.ai_feedback,
      criteria: submission.ai_criteria,
      scored_at: submission.scored_at
    })
  } catch (error) {
    console.error('Error fetching submission score:', error)
    return NextResponse.json(
      { error: 'Failed to fetch submission score' },
      { status: 500 }
    )
  }
}
