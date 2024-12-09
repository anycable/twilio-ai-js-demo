'use client';

import { CallLog, CallLogEntry } from '@/lib/types';
import { format } from 'date-fns';

function maskPhoneNumber(phoneNumber: string): string {
  const parts = phoneNumber.split('');
  const maskedParts = parts.map((char, index) => {
    if (index >= 4 && index <= parts.length - 3) {
      return '*';
    }
    return char;
  });
  return maskedParts.join('');
}

function EntryLine({ entry }: { entry: CallLogEntry }) {
  const time = format(new Date(entry.timestamp), 'HH:mm:ss');

  let content;
  switch (entry.role) {
    case 'system':
      content = <span className="text-muted-foreground">{entry.message}</span>;
      break;
    case 'assistant':
      content = <span className={`text-red-700 ${entry.type === "function" ? "font-mono" : ""}`}>{entry.message}</span>;
      break;
    case 'user':
      content = <span className="text-green-700">{entry.message}</span>;
      break;
  }

  return (
    <div className="flex space-x-3 py-1 items-center">
      <span className="text-xs text-muted-foreground font-mono">{time}</span>
      <div className="flex-1">{content}</div>
    </div>
  );
}

export function Call({ log }: { log: CallLog }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          Call from {maskPhoneNumber(log.phoneNumber)}
        </h3>
        <span className="text-sm text-muted-foreground">
          {format(new Date(log.createdAt), 'MMM d, yyyy')}
        </span>
      </div>
      <div className="space-y-1">
        {log.entries.map((entry, index) => (
          <EntryLine key={index} entry={entry} />
        ))}
      </div>
    </div>
  );
}
