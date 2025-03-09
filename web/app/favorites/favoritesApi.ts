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
          'Authorization': `Bearer ${session?.access_token}`,
        },
        credentials: 'include'
      });
    
      if (!response.ok) {
        const errorText = await response.text();
        reject(`API error: ${response.status} ${errorText}`);
        return;
      }

      const result = await response.json();
      
      if (result.success) {
        resolve(result.data);
      } else {
        reject(result.error);
      }
    } catch (error) {
      reject(error);
    }
  });
} 