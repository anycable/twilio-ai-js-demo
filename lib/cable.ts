import { createCable } from '@anycable/web';

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
