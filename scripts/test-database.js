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

async function testDatabase() {
  console.log('🧪 Testing Supabase database connection...');
  console.log('URL:', supabaseUrl);
  console.log('Key:', supabaseKey.substring(0, 20) + '...');

  try {
    // Test users table
    console.log('\n👥 Testing users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);

    if (usersError) {
      console.error('❌ Users table error:', usersError);
    } else {
      console.log('✅ Users table accessible');
      console.log(`Found ${users.length} users`);
      users.forEach(user => {
        console.log(`  - ${user.display_name} (${user.address})`);
      });
    }

    // Test rooms table
    console.log('\n🏠 Testing rooms table...');
    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select('*')
      .eq('is_public', true)
      .limit(5);

    if (roomsError) {
      console.error('❌ Rooms table error:', roomsError);
    } else {
      console.log('✅ Rooms table accessible');
      console.log(`Found ${rooms.length} public rooms`);
      rooms.forEach(room => {
        console.log(`  - ${room.name} (${room.code}) - ${room.status}`);
      });
    }

    // Test room participants
    console.log('\n👥 Testing room participants...');
    const { data: participants, error: participantsError } = await supabase
      .from('room_participants')
      .select(`
        *,
        users!inner(display_name),
        rooms!inner(name, code)
      `)
      .eq('status', 'active')
      .limit(5);

    if (participantsError) {
      console.error('❌ Room participants error:', participantsError);
    } else {
      console.log('✅ Room participants accessible');
      console.log(`Found ${participants.length} active participants`);
      participants.forEach(participant => {
        console.log(`  - ${participant.users.display_name} in ${participant.rooms.name}`);
      });
    }

    // Test games
    console.log('\n🎮 Testing games table...');
    const { data: games, error: gamesError } = await supabase
      .from('games')
      .select(`
        *,
        rooms!inner(name, code)
      `)
      .limit(5);

    if (gamesError) {
      console.error('❌ Games table error:', gamesError);
    } else {
      console.log('✅ Games table accessible');
      console.log(`Found ${games.length} games`);
      games.forEach(game => {
        console.log(`  - Game in ${game.rooms.name} (${game.status})`);
      });
    }

    // Test submissions
    console.log('\n🎨 Testing submissions table...');
    const { data: submissions, error: submissionsError } = await supabase
      .from('submissions')
      .select(`
        *,
        users!inner(display_name)
      `)
      .limit(5);

    if (submissionsError) {
      console.error('❌ Submissions table error:', submissionsError);
    } else {
      console.log('✅ Submissions table accessible');
      console.log(`Found ${submissions.length} submissions`);
      submissions.forEach(submission => {
        console.log(`  - ${submission.users.display_name}: ${submission.description}`);
      });
    }

    console.log('\n🎉 Database test completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Users: ${users?.length || 0} found`);
    console.log(`- Public Rooms: ${rooms?.length || 0} found`);
    console.log(`- Active Participants: ${participants?.length || 0} found`);
    console.log(`- Games: ${games?.length || 0} found`);
    console.log(`- Submissions: ${submissions?.length || 0} found`);

  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

testDatabase();
