import { atom } from "nanostores";
import type { CallLog, CallLogEntry } from "./types";
import { cable } from "./cable";
import { randomInt } from "crypto";

export const $calls = atom<CallLog[]>([]);

export const addEntry = (
  callId: string,
  phoneNumber: string,
  entry: CallLogEntry,
) => {
  const logs = $calls.get();

  const log = logs.find((log) => log.id === callId);

  if (log) {
    const oldEntry = log.entries.find((ent) => ent.id == entry.id);
    if (oldEntry) {
      oldEntry.message = entry.message;
    } else {
      log.entries.push(entry);
    }
    $calls.set([...logs]);
  } else {
    $calls.set([
      ...logs,
      {
        id: callId,
        entries: [entry],
        phoneNumber,
        createdAt: new Date().toISOString(),
      },
    ]);
  }
};

export function subscribeToCalls() {
  const channel = cable.streamFrom("$calls");
  channel.on("message", (data: any) => {
    const timestamp = new Date().toISOString();
    const entry = {
      timestamp,
      role: data.role,
      message: data.message,
      id: data.logId || timestamp,
      type: data.type || "transcript",
    };
    addEntry(data.callId, data.phoneNumber, entry);
  });

  return () => {
    channel.disconnect();
  };
}
