export interface Task {
  id: string;
  title: string;
  description?: string;
  date: string;
  completed: boolean;
  createdAt: string;
}

export type TasksByDate = {
  [date: string]: Task[];
};