'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface HeaderProps {
  onAddTask: () => void;
}

export function Header({ onAddTask }: HeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        TodoPhone
      </h1>
      <Button onClick={onAddTask} size="sm">
        <Plus className="h-4 w-4 mr-2" />
        Add Task
      </Button>
    </div>
  );
}