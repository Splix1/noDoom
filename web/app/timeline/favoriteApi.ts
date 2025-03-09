'use client';

import { createClient } from '@/utils/supabase/client';

export async function toggleFavorite(postId: string): Promise<boolean> {
  const supabase = createClient();
  const session = await supabase.auth.getSession();
  
  if (!session.data.session) {
    throw new Error('No session found');
  }

  console.log('Sending favorite request with postId:', postId);
  const requestBody = { postId };
  console.log('Request body:', JSON.stringify(requestBody));

  const response = await fetch(`http://localhost:5115/api/favorite`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.data.session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
    credentials: 'include'
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to toggle favorite:', errorText);
    throw new Error('Failed to toggle favorite');
  }

  const data = await response.json();
  return data.isFavorite;
}

export async function checkIsFavorite(postId: string): Promise<boolean> {
  const supabase = createClient();
  const session = await supabase.auth.getSession();
  
  if (!session.data.session) {
    throw new Error('No session found');
  }

  console.log('Checking favorite status for postId:', postId);

  const response = await fetch(`http://localhost:5115/api/favorite?postId=${postId}`, {
    headers: {
      'Authorization': `Bearer ${session.data.session.access_token}`,
    },
    credentials: 'include'
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to check favorite status:', errorText);
    throw new Error('Failed to check favorite status');
  }

  const data = await response.json();
  return data.isFavorite;
} 