export interface Task {
  id: number;
  title: string;
  description?: string;
  date: string;
  completed: boolean;
  createdAt: string;
}

export type TasksByDate = {
  [date: string]: Task[];
};
