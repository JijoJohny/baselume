import { NeynarAPIClient } from '@neynar/nodejs-sdk';
import { NextRequest, NextResponse } from 'next/server';
import { createOrUpdateUser, getUserByAddress } from '~/lib/database';
import { verifyAuth } from '~/lib/auth';

// GET /api/users - Get Farcaster users (existing functionality)
export async function GET(request: Request) {
  const apiKey = process.env.NEYNAR_API_KEY;
  const { searchParams } = new URL(request.url);
  const fids = searchParams.get('fids');
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Neynar API key is not configured. Please add NEYNAR_API_KEY to your environment variables.' },
      { status: 500 }
    );
  }

  if (!fids) {
    return NextResponse.json(
      { error: 'FIDs parameter is required' },
      { status: 400 }
    );
  }

  try {
    const neynar = new NeynarAPIClient({ apiKey });
    const fidsArray = fids.split(',').map(fid => parseInt(fid.trim()));
    
    const { users } = await neynar.fetchBulkUsers({
      fids: fidsArray,
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users. Please check your Neynar API key and try again.' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create or update user profile
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user } = authResult

    const body = await request.json()
    const { displayName, avatarUrl } = body

    if (!displayName) {
      return NextResponse.json(
        { error: 'Display name is required' },
        { status: 400 }
      )
    }

    const dbUser = await createOrUpdateUser(user.address, displayName, avatarUrl)

    return NextResponse.json({ user: dbUser })
  } catch (error) {
    console.error('Error creating/updating user:', error)
    return NextResponse.json(
      { error: 'Failed to create/update user' },
      { status: 500 }
    )
  }
}

// GET /api/users/profile?address=xxx - Get user profile by address
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')

    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      )
    }

    const user = await getUserByAddress(address)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    )
  }
}
