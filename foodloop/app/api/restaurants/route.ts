import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '../../../lib/supabase';
import { clerkClient } from '@clerk/nextjs/server';

interface SaveRestaurantRequest {
  placeId: string;
  name: string;
  image?: string;
  rating?: number;
  types?: string[];
  vicinity?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: SaveRestaurantRequest = await request.json();
    const { placeId, name, image, rating, types, vicinity } = body;

    if (!placeId) {
      return NextResponse.json({ error: 'Place ID is required' }, { status: 400 });
    }

    // Get or create user in DB
    let { data: userRecord, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (userError && userError.code === 'PGRST116') { // No rows found
      // Create user
      const client = await clerkClient();
      const user = await client.users.getUser(userId);

      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          clerk_id: userId,
          email: user.emailAddresses?.[0]?.emailAddress ?? null,
          first_name: user.firstName ?? null,
          last_name: user.lastName ?? null,
        })
        .select('id')
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }

      userRecord = newUser;
    } else if (userError) {
      console.error('Error fetching user:', userError);
      return NextResponse.json({ error: 'Failed to verify user' }, { status: 500 });
    }

    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Use UUID
    const { error } = await supabase
      .from('saved_restaurants')
      .insert({
        user_id: userRecord.id, // ✅ FIXED
        place_id: placeId,
        name,
        image: image || null,
        rating: rating || null,
        types: types || null,
        vicinity: vicinity || null,
      });

    if (error) {
      // If error is due to duplicate, it means already saved
      if (error.code === '23505') {
        return NextResponse.json({ message: 'Restaurant already saved' }, { status: 200 });
      }
      console.error('Error saving restaurant:', error);
      return NextResponse.json({ error: 'Failed to save restaurant' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Restaurant saved successfully' });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get('placeId');

    if (!placeId) {
      return NextResponse.json({ error: 'Place ID is required' }, { status: 400 });
    }

    // get DB user
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (userError || !userRecord) {
      return NextResponse.json({ error: 'User not found (DELETE)' }, { status: 404 });
    }

    const { error } = await supabase
      .from('saved_restaurants')
      .delete()
      .eq('user_id', userRecord.id) // ✅ FIXED
      .eq('place_id', placeId);

    if (error) {
      console.error('Error removing restaurant:', error);
      return NextResponse.json({ error: 'Failed to remove restaurant' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Restaurant removed successfully' });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();


    if (userError || !userRecord) {
      return NextResponse.json({ error: 'User not found (GET)' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('saved_restaurants')
      .select('*')
      .eq('user_id', userRecord.id); // ✅ FIXED

    if (error) {
      console.error('Error fetching saved restaurants:', error);
      return NextResponse.json({ error: 'Failed to fetch saved restaurants' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

