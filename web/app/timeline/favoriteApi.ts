'use client';

import { createClient } from '@/utils/supabase/client';
import { Post } from './types';
import { API_URL } from '@/utils/config';

export async function toggleFavorite(post: Post, currentIsFavorite: boolean): Promise<boolean> {
  const supabase = createClient();
  const session = await supabase.auth.getSession();
  
  if (!session.data.session) {
    throw new Error('No session found');
  }

  if (currentIsFavorite) {
    // Remove favorite
    const response = await fetch(`${API_URL}/api/favorite`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.data.session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ postId: post.id }),
      credentials: 'include'
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error('Failed to remove favorite');
    }

    const data = await response.json();
    return data.isFavorite;
  } else {
    // Add favorite
    return addFavorite(post);
  }
}

export async function checkIsFavorite(postId: string): Promise<boolean> {
  const supabase = createClient();
  const session = await supabase.auth.getSession();
  
  if (!session.data.session) {
    throw new Error('No session found');
  }

  const response = await fetch(`${API_URL}/api/favorite?postId=${postId}`, {
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

export async function addFavorite(post: Post): Promise<boolean> {
  const supabase = createClient();
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error("No session found");
    }

    const response = await fetch(`${API_URL}/api/favorite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        postId: post.id,
        postDetails: post
      }),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Failed to add favorite: ${response.status}`);
    }

    const result = await response.json();
    return result.isFavorite;
  } catch (error) {
    console.error('Error adding favorite:', error);
    throw error;
  }
} 