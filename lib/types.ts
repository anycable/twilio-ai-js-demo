export interface Task {
  id: number;
  title: string;
  description: string | null;
  date: string | Date;
  completed: boolean;
  createdAt: string | Date;
}

export type TasksByDate = {
  [date: string]: Task[];
};
