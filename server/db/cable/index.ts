import { broadcaster } from "@anycable/serverless-js";

const broadcastUrl = process.env.ANYCABLE_BROADCAST_URL as string;

export const broadcastTo = broadcaster(broadcastUrl, undefined);
