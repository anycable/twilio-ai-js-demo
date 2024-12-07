import { Channel, ChannelHandle } from "@anycable/serverless-js";
import type { CableIdentifiers } from "./types";
import { synthesizeAudio } from "@/server/services/voice";
import { broadcastTo } from ".";

// Define the channel params (used by the client according to Action Cable protocol)
type MediaStreamChannelParams = {};

type MediaStreamChannelState = {
  anycable_response: any;
};

export type TwilioMessage = {
  event: string;
  streamSid: string;
  media: any;
  mark: any;
};

const GREETING = `
  Hi, I'm Annie.
  I can tell you about your planned tasks and
  help to you manage them. What would you like to do?
`;

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const PROMPT = `
  You are a voice assistant focused solely on weekly planning and task management.
  You speak briefly and clearly, with an encouraging tone.
  Your only purpose is to help users manage their todos and weekly schedule within the app.

  Core functions:
  - Browse tasks (today, tomorrow, this week)
  - Add new tasks
  - Mark tasks complete

  Response rules:
  - Keep responses under 2 sentences
  - Always use function calls for actions
  - Confirm actions with brief acknowledgments
  - Stay strictly within app features

  Do not:
  - Suggest features not in the app
  - Discuss topics unrelated to tasks/planning
  - Give advice beyond task management
  - Engage in general conversation
  - Make promises about future features
  - Explain your limitations or nature

  Example responses:
  "You have no tasks today. Congrats!"
  "Added 'Dentist appointment' to Thursday. Need anything else?"
  "Task marked complete. You have 4 remaining today."
`;

type DTMFMessage = {
  digit: string;
};

export default class MediaStreamChannel extends Channel<
  CableIdentifiers,
  MediaStreamChannelParams,
  TwilioMessage,
  MediaStreamChannelState
> {
  // The `subscribed` method is called when the client subscribes to the channel
  // You can use it to authorize the subscription and setup streaming
  async subscribed(
    handle: ChannelHandle<CableIdentifiers>,
    params: MediaStreamChannelParams | null,
  ) {
    handle.streamFrom(`call/${handle.identifiers?.stream_sid}`);

    // transmit greeting message (asynchronously to not block the RPC execution)
    this.transmit_message(handle, GREETING);
  }

  async handle_dtmf(
    handle: ChannelHandle<CableIdentifiers>,
    params: MediaStreamChannelParams | null,
    data: DTMFMessage,
  ) {
    console.log(`User pressed ${data.digit}`);
  }

  async configure_openai(
    handle: ChannelHandle<CableIdentifiers>,
    params: MediaStreamChannelParams | null,
  ) {
    const tools = JSON.stringify([
      {
        type: "function",
        name: "get_tasks",
        description: "Fetch user's tasks for a given period of time",
        parameters: {
          type: "object",
          properties: {
            period: {
              type: "string",
              enum: ["today", "tomorrow", "week"],
            },
          },
          required: ["period"],
        },
      },
      {
        type: "function",
        name: "create_task",
        description: "Create a new task for a specified date",
        parameters: {
          type: "object",
          properties: {
            date: {
              type: "string",
              format: "date",
            },
            description: {
              type: "string",
            },
          },
          required: ["date", "description"],
        },
      },
      {
        type: "function",
        name: "complete_task",
        description: "Mark a task as completed",
        parameters: {
          type: "object",
          properties: {
            id: {
              type: "integer",
            },
          },
          required: ["id"],
        },
      },
    ]);

    return this.reply(handle, "openai.configuration", {
      api_key: OPENAI_API_KEY,
      prompt: PROMPT,
      tools,
    });
  }

  async handle_transcript(
    handle: ChannelHandle<CableIdentifiers>,
    params: MediaStreamChannelParams | null,
    data: { role: "user" | "assistant"; text: string; id: string },
  ) {
    console.log(`${data.role.toUpperCase()}: ${data.text}`);
  }

  async handle_function_call(
    handle: ChannelHandle<CableIdentifiers>,
    params: MediaStreamChannelParams | null,
    data: { name: string; arguments: string },
  ) {
    console.log(`Call function ${data.name}(${data.arguments})`);
  }

  private async transmit_message(
    handle: ChannelHandle<CableIdentifiers>,
    message: string,
  ) {
    const base64Audio = await synthesizeAudio(message);

    // Send media message to the twilio stream connection
    broadcastTo(`call/${handle.identifiers?.stream_sid}`, {
      event: "media",
      streamSid: handle.identifiers!.stream_sid,
      media: {
        payload: base64Audio,
      },
    });
  }

  private async reply(
    handle: ChannelHandle<CableIdentifiers, MediaStreamChannelState>,
    event: string,
    data: any,
  ) {
    // We pass internal information via the channel state
    // (transmit/broadcast can only be used to send data to the connection)
    handle.state = { anycable_response: { event, data } };
  }
}
