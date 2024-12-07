import {
  Application,
  ConnectionHandle,
} from "@anycable/serverless-js";

import { CableIdentifiers } from "./types";
import MediaStreamChannel from "./media_stream_channel";

class CableApplication extends Application<CableIdentifiers> {
  async connect(handle: ConnectionHandle<CableIdentifiers>) {
    // IMPORTANT: Authentication must be handled by the WebSocket server
    handle.reject();
  }

  async disconnect(handle: ConnectionHandle<CableIdentifiers>) {
    console.log(`Call ${handle.identifiers!.call_sid} disconnected`);
  }
}

// Create and instance of the class to use in HTTP handlers (see the next section)
const app = new CableApplication();

// Register channels
app.registerChannel("Twilio::MediaStreamChannel", new MediaStreamChannel());

export default app;
