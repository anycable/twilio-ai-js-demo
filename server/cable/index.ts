import { broadcaster } from "@anycable/serverless-js";

const broadcastUrl = process.env.ANYCABLE_BROADCAST_URL as string;

export const broadcastTo = broadcaster(broadcastUrl, undefined);

export const broadcastCallLog = async (callId: string, role: string, message: string, meta?: any) => {
  const payload = {...meta, callId, role, message };

  return broadcastTo("$calls", payload);
};
