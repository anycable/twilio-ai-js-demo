"use client";

import { useStore } from "@nanostores/react";
import { useEffect } from "react";
import { $calls, subscribeToCalls, addEntry } from "@/lib/calls";
import { Call } from "@/components/Call";

export default function CallsPage() {
  const logs = useStore($calls);

  useEffect(() => {
    const unsubscribe = subscribeToCalls();

    return () => {
      unsubscribe();
    };
  }, []);

  if (logs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No call logs available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        Call Logs
      </h1>
      <div className="space-y-4">
        {logs.map((log) => (
          <Call key={log.id} log={log} />
        ))}
      </div>
    </div>
  );
}
