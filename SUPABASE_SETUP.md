# Supabase Setup Instructions

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your project URL and anon key

## 2. Environment Variables

Add these to your `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Existing environment variables
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=baselume
NEXT_PUBLIC_APP_DESCRIPTION=Competitive gaming platform on Base
NEXT_PUBLIC_APP_ICON_URL=https://your-domain.com/icon.png

# Neynar API (for Farcaster integration)
NEYNAR_API_KEY=your_neynar_api_key

# Gemini AI API (for drawing scoring)
GEMINI_API_KEY=your_gemini_api_key

# Wallet Configuration
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

## 3. Database Setup

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase-schema.sql`
4. Run the SQL to create all tables, indexes, and policies

## 4. Database Schema

The schema includes:

- **users**: Store user profiles with wallet addresses
- **rooms**: Game rooms with settings and status
- **room_participants**: Track who's in each room
- **games**: Individual game sessions within rooms
- **submissions**: User drawings and descriptions
- **votes**: Voting system for submissions

## 5. Features Enabled

- Row Level Security (RLS) for data protection
- Real-time subscriptions for live updates
- Automatic timestamp updates
- Optimized indexes for performance
- Unique constraints to prevent duplicates

## 6. Gemini AI Setup

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key for Gemini
3. Add the API key to your `.env.local` file as `GEMINI_API_KEY`

## 7. Database Schema Updates

Run this SQL in your Supabase SQL Editor to add AI scoring fields:

```sql
-- Add scoring fields to submissions table
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS ai_score INTEGER CHECK (ai_score >= 1 AND ai_score <= 10),
ADD COLUMN IF NOT EXISTS ai_feedback TEXT,
ADD COLUMN IF NOT EXISTS ai_criteria JSONB,
ADD COLUMN IF NOT EXISTS scored_at TIMESTAMP WITH TIME ZONE;

-- Create index for scoring queries
CREATE INDEX IF NOT EXISTS idx_submissions_ai_score ON submissions(ai_score);
```

## 8. Testing

After setup, the app will:
- Automatically create/update user profiles when connecting wallets
- Create and manage game rooms
- Handle real-time room updates
- Store and retrieve drawings and votes
- **NEW**: Automatically score drawings with AI when submitted
- **NEW**: Display detailed feedback and scoring criteria
