'use client';

import { Phone, CheckSquare } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex space-x-4 mb-8">
      <Link
        href="/"
        className={cn(
          "flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors",
          pathname === "/"
            ? "bg-primary text-primary-foreground"
            : "hover:bg-secondary"
        )}
      >
        <CheckSquare className="h-4 w-4" />
        <span>Tasks</span>
      </Link>
      <Link
        href="/calls"
        className={cn(
          "flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors",
          pathname === "/calls"
            ? "bg-primary text-primary-foreground"
            : "hover:bg-secondary"
        )}
      >
        <Phone className="h-4 w-4" />
        <span>Call Logs</span>
      </Link>
    </nav>
  );
}
