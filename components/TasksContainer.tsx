'use client';

import { TaskList } from '@/components/TaskList';
import { useStore } from '@nanostores/react';
import { $tasks } from '@/lib/store';
import { groupTasksByDate } from '@/lib/tasks';

export function TasksContainer() {
  const tasks = useStore($tasks);
  const tasksByDate = groupTasksByDate(tasks);
  const dates = Object.keys(tasksByDate).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );

  if (dates.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No tasks yet. Click the button above to add your first task!
        </p>
      </div>
    );
  }

  return (
    <>
      {dates.map((date) => (
        <TaskList
          key={date}
          date={date}
          tasks={tasksByDate[date]}
        />
      ))}
    </>
  );
}