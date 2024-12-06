'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { NewTaskDialog } from '@/components/NewTaskDialog';
import { TasksContainer } from '@/components/TasksContainer';
import { subscribeToTasks } from '@/lib/tasks';

export default function Home() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToTasks(() => {
      setIsLoading(false);
    });

    // Set loading to false after a short delay if tasks are already loaded
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-8" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Header onAddTask={() => setIsDialogOpen(true)} />
        <TasksContainer />
        <NewTaskDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onTaskAdded={() => {}} // No longer needed as we're using the store
        />
      </div>
    </div>
  );
}