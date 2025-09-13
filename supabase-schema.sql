-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    address TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    host_address TEXT NOT NULL REFERENCES users(address) ON DELETE CASCADE,
    theme TEXT,
    max_players INTEGER DEFAULT 8,
    status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'starting', 'in_progress', 'completed')),
    is_public BOOLEAN DEFAULT false,
    time_limit INTEGER, -- in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create room_participants table
CREATE TABLE IF NOT EXISTS room_participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    user_address TEXT NOT NULL REFERENCES users(address) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'left', 'disconnected')),
    UNIQUE(room_id, user_address)
);

-- Create games table
CREATE TABLE IF NOT EXISTS games (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'drawing', 'voting', 'completed')),
    prompt TEXT,
    time_limit INTEGER, -- in seconds
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    user_address TEXT NOT NULL REFERENCES users(address) ON DELETE CASCADE,
    drawing_data TEXT NOT NULL, -- Base64 encoded drawing data
    description TEXT NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(game_id, user_address)
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    voter_address TEXT NOT NULL REFERENCES users(address) ON DELETE CASCADE,
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(game_id, voter_address)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_is_public ON rooms(is_public);
CREATE INDEX IF NOT EXISTS idx_room_participants_room_id ON room_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_room_participants_user_address ON room_participants(user_address);
CREATE INDEX IF NOT EXISTS idx_room_participants_status ON room_participants(status);
CREATE INDEX IF NOT EXISTS idx_games_room_id ON games(room_id);
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_submissions_game_id ON submissions(game_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user_address ON submissions(user_address);
CREATE INDEX IF NOT EXISTS idx_votes_game_id ON votes(game_id);
CREATE INDEX IF NOT EXISTS idx_votes_voter_address ON votes(voter_address);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Users can read and update their own data
CREATE POLICY "Users can read own data" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own data" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (true);

-- Rooms policies
CREATE POLICY "Anyone can read public rooms" ON rooms
    FOR SELECT USING (is_public = true OR host_address = auth.jwt() ->> 'address');

CREATE POLICY "Users can create rooms" ON rooms
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Room hosts can update their rooms" ON rooms
    FOR UPDATE USING (host_address = auth.jwt() ->> 'address');

-- Room participants policies
CREATE POLICY "Anyone can read room participants" ON room_participants
    FOR SELECT USING (true);

CREATE POLICY "Users can join rooms" ON room_participants
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can leave rooms" ON room_participants
    FOR UPDATE USING (user_address = auth.jwt() ->> 'address');

-- Games policies
CREATE POLICY "Anyone can read games" ON games
    FOR SELECT USING (true);

CREATE POLICY "Room hosts can create games" ON games
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Room hosts can update games" ON games
    FOR UPDATE USING (true);

-- Submissions policies
CREATE POLICY "Anyone can read submissions" ON submissions
    FOR SELECT USING (true);

CREATE POLICY "Users can create submissions" ON submissions
    FOR INSERT WITH CHECK (true);

-- Votes policies
CREATE POLICY "Anyone can read votes" ON votes
    FOR SELECT USING (true);

CREATE POLICY "Users can create votes" ON votes
    FOR INSERT WITH CHECK (true);

-- Create a function to get room with participant count
CREATE OR REPLACE FUNCTION get_room_with_participant_count(room_code TEXT)
RETURNS TABLE (
    id UUID,
    name TEXT,
    code TEXT,
    host_address TEXT,
    theme TEXT,
    max_players INTEGER,
    status TEXT,
    is_public BOOLEAN,
    time_limit INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    participant_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.name,
        r.code,
        r.host_address,
        r.theme,
        r.max_players,
        r.status,
        r.is_public,
        r.time_limit,
        r.created_at,
        r.updated_at,
        COUNT(rp.id) as participant_count
    FROM rooms r
    LEFT JOIN room_participants rp ON r.id = rp.room_id AND rp.status = 'active'
    WHERE r.code = room_code
    GROUP BY r.id, r.name, r.code, r.host_address, r.theme, r.max_players, r.status, r.is_public, r.time_limit, r.created_at, r.updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
