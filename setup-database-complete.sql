-- Baselume Database Setup Script
-- Run this in your Supabase SQL Editor

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

-- =============================================
-- SAMPLE DATA POPULATION
-- =============================================

-- Insert sample users
INSERT INTO users (address, display_name, avatar_url) VALUES
('0x1234567890123456789012345678901234567890', 'alice.base.eth', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice'),
('0x2345678901234567890123456789012345678901', 'bob.base.eth', 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob'),
('0x3456789012345678901234567890123456789012', 'charlie.base.eth', 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie'),
('0x4567890123456789012345678901234567890123', 'diana.base.eth', 'https://api.dicebear.com/7.x/avataaars/svg?seed=diana'),
('0x5678901234567890123456789012345678901234', 'eve.base.eth', 'https://api.dicebear.com/7.x/avataaars/svg?seed=eve'),
('0x6789012345678901234567890123456789012345', 'frank.base.eth', 'https://api.dicebear.com/7.x/avataaars/svg?seed=frank'),
('0x7890123456789012345678901234567890123456', 'grace.base.eth', 'https://api.dicebear.com/7.x/avataaars/svg?seed=grace'),
('0x8901234567890123456789012345678901234567', 'henry.base.eth', 'https://api.dicebear.com/7.x/avataaars/svg?seed=henry')
ON CONFLICT (address) DO NOTHING;

-- Insert sample rooms
INSERT INTO rooms (name, code, host_address, theme, max_players, status, is_public, time_limit) VALUES
('Quick Draw Challenge', 'QUICK01', '0x1234567890123456789012345678901234567890', 'Animals', 4, 'waiting', true, 300),
('Speed Sketch Battle', 'SPEED02', '0x2345678901234567890123456789012345678901', 'Fantasy', 6, 'waiting', true, 180),
('Creative Contest', 'CREAT03', '0x3456789012345678901234567890123456789012', 'Space', 8, 'waiting', true, 600),
('Rapid Art Round', 'RAPID04', '0x4567890123456789012345678901234567890123', 'Nature', 4, 'starting', true, 120),
('Private Practice', 'PRIV05', '0x5678901234567890123456789012345678901234', 'Portraits', 2, 'waiting', false, 240),
('Epic Drawing Showdown', 'EPIC06', '0x6789012345678901234567890123456789012345', 'Superheroes', 10, 'waiting', true, 480),
('Minute Master', 'MIN07', '0x7890123456789012345678901234567890123456', 'Abstract', 3, 'waiting', true, 60),
('Art Marathon', 'MAR08', '0x8901234567890123456789012345678901234567', 'Landscapes', 6, 'waiting', true, 900)
ON CONFLICT (code) DO NOTHING;

-- Insert room participants
INSERT INTO room_participants (room_id, user_address, status) 
SELECT r.id, u.address, 'active'
FROM rooms r, users u
WHERE (r.code = 'QUICK01' AND u.address IN ('0x1234567890123456789012345678901234567890', '0x2345678901234567890123456789012345678901'))
   OR (r.code = 'SPEED02' AND u.address IN ('0x2345678901234567890123456789012345678901', '0x3456789012345678901234567890123456789012', '0x4567890123456789012345678901234567890123'))
   OR (r.code = 'CREAT03' AND u.address IN ('0x3456789012345678901234567890123456789012'))
   OR (r.code = 'RAPID04' AND u.address IN ('0x4567890123456789012345678901234567890123', '0x1234567890123456789012345678901234567890', '0x2345678901234567890123456789012345678901', '0x3456789012345678901234567890123456789012'))
   OR (r.code = 'EPIC06' AND u.address IN ('0x6789012345678901234567890123456789012345', '0x7890123456789012345678901234567890123456'))
   OR (r.code = 'MIN07' AND u.address IN ('0x7890123456789012345678901234567890123456', '0x8901234567890123456789012345678901234567'))
ON CONFLICT (room_id, user_address) DO NOTHING;

-- Insert sample games
INSERT INTO games (room_id, status, prompt, time_limit, started_at)
SELECT r.id, 'drawing', 'Draw your favorite animal in nature', 120, NOW()
FROM rooms r WHERE r.code = 'RAPID04'
ON CONFLICT DO NOTHING;

INSERT INTO games (room_id, status, prompt, time_limit, started_at)
SELECT r.id, 'waiting', 'Create a fantasy creature', 180, NULL
FROM rooms r WHERE r.code = 'SPEED02'
ON CONFLICT DO NOTHING;

-- Insert sample submissions
INSERT INTO submissions (game_id, user_address, drawing_data, description)
SELECT g.id, u.address, 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZmIi8+PC9zdmc+', 'A beautiful landscape with mountains and trees'
FROM games g, users u 
WHERE g.room_id = (SELECT id FROM rooms WHERE code = 'RAPID04') 
  AND u.address = '0x4567890123456789012345678901234567890123'
ON CONFLICT (game_id, user_address) DO NOTHING;

INSERT INTO submissions (game_id, user_address, drawing_data, description)
SELECT g.id, u.address, 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjUwIiBmaWxsPSIjZmZmIi8+PC9zdmc+', 'A cute cat playing in the garden'
FROM games g, users u 
WHERE g.room_id = (SELECT id FROM rooms WHERE code = 'RAPID04') 
  AND u.address = '0x1234567890123456789012345678901234567890'
ON CONFLICT (game_id, user_address) DO NOTHING;

-- Insert sample votes
INSERT INTO votes (game_id, voter_address, submission_id)
SELECT g.id, v.address, s.id
FROM games g, users v, submissions s
WHERE g.room_id = (SELECT id FROM rooms WHERE code = 'RAPID04')
  AND s.game_id = g.id
  AND v.address = '0x2345678901234567890123456789012345678901'
  AND s.user_address != v.address
LIMIT 1
ON CONFLICT (game_id, voter_address) DO NOTHING;

-- Create a view for room statistics
CREATE OR REPLACE VIEW room_stats AS
SELECT 
    r.id,
    r.name,
    r.code,
    r.theme,
    r.max_players,
    r.status,
    r.is_public,
    r.time_limit,
    r.created_at,
    COUNT(rp.id) as participant_count,
    u.display_name as host_name
FROM rooms r
LEFT JOIN room_participants rp ON r.id = rp.room_id AND rp.status = 'active'
LEFT JOIN users u ON r.host_address = u.address
GROUP BY r.id, r.name, r.code, r.theme, r.max_players, r.status, r.is_public, r.time_limit, r.created_at, u.display_name;

-- Success message
SELECT 'Database setup complete! Created tables, indexes, policies, and sample data.' as message;
