'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Clock, Heart } from 'lucide-react';

export function FeedNavigation() {
  const pathname = usePathname();

  return (
    <nav className="flex justify-center gap-4 mb-6">
      <Link
        href="/timeline"
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
          "hover:bg-accent/50",
          pathname === '/timeline' ? "bg-accent text-accent-foreground" : "text-muted-foreground"
        )}
      >
        <Clock className="w-4 h-4" />
        <span>Timeline</span>
      </Link>
      <Link
        href="/favorites"
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
          "hover:bg-accent/50",
          pathname === '/favorites' ? "bg-accent text-accent-foreground" : "text-muted-foreground"
        )}
      >
        <Heart className="w-4 h-4" />
        <span>Favorites</span>
      </Link>
    </nav>
  );
} 