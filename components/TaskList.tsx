'use client';

import { Task } from '@/lib/types';
import { format } from 'date-fns';
import { Check, Trash2 } from 'lucide-react';
import { toggleTaskCompletion, deleteTask } from '@/lib/tasks';
import { useEffect, useState } from 'react';

interface TaskListProps {
  date: string;
  tasks: Task[];
}

export function TaskList({ date, tasks }: TaskListProps) {
  const [formattedDate, setFormattedDate] = useState<string>('');

  useEffect(() => {
    setFormattedDate(format(new Date(date), 'EEEE, MMMM d'));
  }, [date]);

  const handleToggle = async (taskId: string, currentState: boolean) => {
    await toggleTaskCompletion(taskId, currentState);
  };

  const handleDelete = async (taskId: string) => {
    await deleteTask(taskId);
  };

  if (!formattedDate) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
        {formattedDate}
      </h2>
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <button
              onClick={() => handleToggle(task.id, task.completed)}
              className={`h-5 w-5 rounded border flex items-center justify-center transition-colors ${
                task.completed
                  ? 'bg-primary border-primary'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              {task.completed && <Check className="h-4 w-4 text-primary-foreground" />}
            </button>
            <div className="flex-1">
              <p
                className={`text-sm font-medium ${
                  task.completed ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-200'
                }`}
              >
                {task.title}
              </p>
              {task.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {task.description}
                </p>
              )}
            </div>
            <button
              onClick={() => handleDelete(task.id)}
              className="text-gray-400 hover:text-destructive transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}