'use client';

import { createClient } from '@/utils/supabase/client';
import { Post } from '../timeline/types';

export function fetchFavoritesData(): Promise<Post[]> {
  const supabase = createClient();
  
  return new Promise(async (resolve, reject) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        reject("No session found");
        return;
      }

      const response = await fetch('http://localhost:5115/api/favorite/posts', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        credentials: 'include'
      });
    
      if (!response.ok) {
        reject(`API error: ${response.status}`);
        return;
      }

      const result = await response.json();
      // Ensure we're returning an array of posts
      if (Array.isArray(result)) {
        resolve(result);
      } else if (Array.isArray(result.data)) {
        resolve(result.data);
      } else {
        resolve([]);
      }
    } catch (error) {
      reject(error);
    }
  });
} 