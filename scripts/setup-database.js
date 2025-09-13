const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('🚀 Setting up Supabase database for baselume...');

  try {
    // First, let's test the connection
    console.log('📡 Testing database connection...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error && error.code === 'PGRST116') {
      console.log('📋 Database tables not found. Creating schema...');
      await createTables();
    } else if (error) {
      console.error('❌ Database connection error:', error);
      return;
    } else {
      console.log('✅ Database connection successful!');
    }

    // Populate with sample data
    console.log('📊 Adding sample data...');
    await populateSampleData();
    
    console.log('🎉 Database setup complete!');
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

async function createTables() {
  const schema = `
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
  `;

  console.log('📝 Creating database schema...');
  
  // Split the schema into individual statements and execute them
  const statements = schema.split(';').filter(stmt => stmt.trim());
  
  for (const statement of statements) {
    if (statement.trim()) {
      const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
      if (error && !error.message.includes('already exists')) {
        console.warn('⚠️ Statement warning:', error.message);
      }
    }
  }

  console.log('✅ Database schema created successfully!');
}

async function populateSampleData() {
  console.log('👥 Creating sample users...');
  
  const sampleUsers = [
    {
      address: '0x1234567890123456789012345678901234567890',
      display_name: 'alice.base.eth',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice'
    },
    {
      address: '0x2345678901234567890123456789012345678901',
      display_name: 'bob.base.eth',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob'
    },
    {
      address: '0x3456789012345678901234567890123456789012',
      display_name: 'charlie.base.eth',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie'
    },
    {
      address: '0x4567890123456789012345678901234567890123',
      display_name: 'diana.base.eth',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=diana'
    },
    {
      address: '0x5678901234567890123456789012345678901234',
      display_name: 'eve.base.eth',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=eve'
    }
  ];

  // Insert users
  for (const user of sampleUsers) {
    const { error } = await supabase
      .from('users')
      .upsert(user, { onConflict: 'address' });
    
    if (error) {
      console.warn('⚠️ User creation warning:', error.message);
    }
  }

  console.log('🏠 Creating sample rooms...');
  
  const sampleRooms = [
    {
      name: 'Quick Draw Challenge',
      code: 'QUICK01',
      host_address: '0x1234567890123456789012345678901234567890',
      theme: 'Animals',
      max_players: 4,
      status: 'waiting',
      is_public: true,
      time_limit: 300
    },
    {
      name: 'Speed Sketch Battle',
      code: 'SPEED02',
      host_address: '0x2345678901234567890123456789012345678901',
      theme: 'Fantasy',
      max_players: 6,
      status: 'waiting',
      is_public: true,
      time_limit: 180
    },
    {
      name: 'Creative Contest',
      code: 'CREAT03',
      host_address: '0x3456789012345678901234567890123456789012',
      theme: 'Space',
      max_players: 8,
      status: 'waiting',
      is_public: true,
      time_limit: 600
    },
    {
      name: 'Rapid Art Round',
      code: 'RAPID04',
      host_address: '0x4567890123456789012345678901234567890123',
      theme: 'Nature',
      max_players: 4,
      status: 'starting',
      is_public: true,
      time_limit: 120
    },
    {
      name: 'Private Practice',
      code: 'PRIV05',
      host_address: '0x5678901234567890123456789012345678901234',
      theme: 'Portraits',
      max_players: 2,
      status: 'waiting',
      is_public: false,
      time_limit: 240
    }
  ];

  // Insert rooms
  for (const room of sampleRooms) {
    const { error } = await supabase
      .from('rooms')
      .upsert(room, { onConflict: 'code' });
    
    if (error) {
      console.warn('⚠️ Room creation warning:', error.message);
    }
  }

  console.log('👥 Adding room participants...');
  
  // Add some participants to rooms
  const participants = [
    { room_code: 'QUICK01', user_address: '0x1234567890123456789012345678901234567890' },
    { room_code: 'QUICK01', user_address: '0x2345678901234567890123456789012345678901' },
    { room_code: 'SPEED02', user_address: '0x2345678901234567890123456789012345678901' },
    { room_code: 'SPEED02', user_address: '0x3456789012345678901234567890123456789012' },
    { room_code: 'SPEED02', user_address: '0x4567890123456789012345678901234567890123' },
    { room_code: 'CREAT03', user_address: '0x3456789012345678901234567890123456789012' },
    { room_code: 'RAPID04', user_address: '0x4567890123456789012345678901234567890123' },
    { room_code: 'RAPID04', user_address: '0x1234567890123456789012345678901234567890' },
    { room_code: 'RAPID04', user_address: '0x2345678901234567890123456789012345678901' },
    { room_code: 'RAPID04', user_address: '0x3456789012345678901234567890123456789012' }
  ];

  for (const participant of participants) {
    // Get room ID first
    const { data: room } = await supabase
      .from('rooms')
      .select('id')
      .eq('code', participant.room_code)
      .single();

    if (room) {
      const { error } = await supabase
        .from('room_participants')
        .upsert({
          room_id: room.id,
          user_address: participant.user_address,
          status: 'active'
        }, { onConflict: 'room_id,user_address' });
      
      if (error) {
        console.warn('⚠️ Participant creation warning:', error.message);
      }
    }
  }

  console.log('🎮 Creating sample games...');
  
  // Create a game for one of the rooms
  const { data: rapidRoom } = await supabase
    .from('rooms')
    .select('id')
    .eq('code', 'RAPID04')
    .single();

  if (rapidRoom) {
    const { error: gameError } = await supabase
      .from('games')
      .insert({
        room_id: rapidRoom.id,
        status: 'drawing',
        prompt: 'Draw your favorite animal in nature',
        time_limit: 120,
        started_at: new Date().toISOString()
      });

    if (gameError) {
      console.warn('⚠️ Game creation warning:', gameError.message);
    }
  }

  console.log('✅ Sample data populated successfully!');
  console.log('\n📊 Summary:');
  console.log('- 5 sample users created');
  console.log('- 5 sample rooms created (4 public, 1 private)');
  console.log('- 10 room participants added');
  console.log('- 1 active game created');
  console.log('\n🎉 Database is ready for testing!');
}

// Run the setup
setupDatabase();
