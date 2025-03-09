'use client';

import { createClient } from '@/utils/supabase/client';

export async function toggleFavorite(postId: string, currentIsFavorite: boolean): Promise<boolean> {
  const supabase = createClient();
  const session = await supabase.auth.getSession();
  
  if (!session.data.session) {
    throw new Error('No session found');
  }

  const requestBody = { postId };

  const response = await fetch(`http://localhost:5115/api/favorite`, {
    method: currentIsFavorite ? 'DELETE' : 'POST',
    headers: {
      'Authorization': `Bearer ${session.data.session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
    credentials: 'include'
  });

  if (!response.ok) {
    const errorText = await response.text();
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

  const response = await fetch(`http://localhost:5115/api/favorite?postId=${postId}`, {
    headers: {
      'Authorization': `Bearer ${session.data.session.access_token}`,
    },
    credentials: 'include'
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error('Failed to check favorite status');
  }

  const data = await response.json();
  return data.isFavorite;
} 