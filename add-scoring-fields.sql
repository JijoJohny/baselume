-- Add scoring fields to submissions table
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS ai_score INTEGER CHECK (ai_score >= 1 AND ai_score <= 10),
ADD COLUMN IF NOT EXISTS ai_feedback TEXT,
ADD COLUMN IF NOT EXISTS ai_criteria JSONB,
ADD COLUMN IF NOT EXISTS scored_at TIMESTAMP WITH TIME ZONE;

-- Create index for scoring queries
CREATE INDEX IF NOT EXISTS idx_submissions_ai_score ON submissions(ai_score);

-- Update existing submissions with default values (optional)
UPDATE submissions 
SET ai_score = NULL, ai_feedback = NULL, ai_criteria = NULL, scored_at = NULL 
WHERE ai_score IS NULL;

-- Create a view for submissions with scoring
CREATE OR REPLACE VIEW submissions_with_scores AS
SELECT 
    s.*,
    u.display_name,
    u.avatar_url,
    g.prompt as game_prompt,
    r.theme as room_theme,
    CASE 
        WHEN s.ai_score IS NOT NULL THEN s.ai_score
        ELSE NULL
    END as final_score
FROM submissions s
LEFT JOIN users u ON s.user_address = u.address
LEFT JOIN games g ON s.game_id = g.id
LEFT JOIN rooms r ON g.room_id = r.id;

-- Success message
SELECT 'Scoring fields added to submissions table successfully!' as message;
