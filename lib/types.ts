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

export interface CallLog {
  id: string;
  phoneNumber: string;
  createdAt: string;
  entries: CallLogEntry[];
}

export interface CallLogEntry {
  id?: string;
  timestamp: string;
  role: 'system' | 'assistant' | 'user';
  type?: 'transcript' | 'function';
  message: string;
}
