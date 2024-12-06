import { createCable } from '@anycable/web';
import { broadcaster } from "@anycable/serverless-js";

export const cable = createCable(
  process.env.NEXT_PUBLIC_ANYCABLE_WS_URL || 'ws://localhost:8080/cable',
  {
    protocol: "actioncable-v1-ext-json",
    logLevel: "error",
    reconnect: {
      maxRetries: 3,
      delay: 1000,
      backoff: true
    }
  }
);


const broadcastUrl = process.env.NEXT_PUBLIC_ANYCABLE_BROADCAST_URL as string;

export const broadcastTo = broadcaster(broadcastUrl, undefined);
