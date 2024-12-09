import { Channel, ChannelHandle } from "@anycable/serverless-js";
import type { CableIdentifiers } from "./types";
import { synthesizeAudio } from "@/server/modules/voice";
import { broadcastTo, broadcastCallLog } from ".";
import { allTasks, createTask, deleteTask, tasksForPeriod, updateTask } from "@/server/modules/tasks";
import { Task } from "@/lib/types";

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

const DTMF_GREETING = `
  Hi, I'm Annie.
  Press 1 to check tasks for today. \
  Press 2 to check tasks for tomorrow. \
  Press 3 to check tasks for this week.
`;

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const DISABLE_OPENAI_REALTIME = process.env.DISABLE_OPENAI_REALTIME === "true";

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

  Start conversation proactively with a greeting like this one:

  "Hi, I'm <your name>! I can tell you about your planned tasks and help to you manage them. What would you like to do?"

  Example responses:
  "You have no tasks today. Congrats!"
  "Added 'Dentist appointment' to Thursday. Need anything else?"
  "Task marked complete. You have 4 remaining today."
`;

interface Tools {
  get_tasks: (arg: {
    period: "today" | "tomorrow" | "week";
  }) => Promise<Task[]>;
  create_task: (arg: {
    date: string;
    description: string;
  }) => Promise<{ status: string; error?: string; task?: Task }>;
  complete_task: (arg: {
    id: number;
  }) => Promise<{ status: string; error?: string }>;
  delete_task: (arg: {
    id: number;
  }) => Promise<{ status: string; error?: string }>;
}

type ToolParameters = { [K in keyof Tools]: Parameters<Tools[K]>[0] };

type ToolSchema<K> = K extends keyof ToolParameters
  ? {
      type: "function";
      name: K;
      description: string;
      parameters: {
        type: "object";
        properties: Record<
          keyof ToolParameters[K],
          { type: string; format?: string; enum?: any }
        >;
        required?: (keyof ToolParameters[K])[];
      };
    }
  : never;

const TOOLS: ToolSchema<keyof Tools>[] = [
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
  {
    type: "function",
    name: "delete_task",
    description: "Delete task",
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
];

type DTMFMessage = {
  digit: string;
};

export default class MediaStreamChannel
  extends Channel<
    CableIdentifiers,
    MediaStreamChannelParams,
    TwilioMessage,
    MediaStreamChannelState
  >
  implements Tools
{
  // The `subscribed` method is called when the client subscribes to the channel
  // You can use it to authorize the subscription and setup streaming
  async subscribed(
    handle: ChannelHandle<CableIdentifiers>,
    params: MediaStreamChannelParams | null,
  ) {
    handle.streamFrom(`call/${handle.identifiers?.stream_sid}`);

    broadcastCallLog(handle.identifiers!.call_sid, 'system', 'Media stream started');

    // transmit greeting message (asynchronously to not block the RPC execution)
    // NOTE: only if no OpenAI Realtime configured.
    // Otherwise, the assistant will send the greeting
    // after the configuration is done.
    if (DISABLE_OPENAI_REALTIME) {
      this.transmit_message(handle, DTMF_GREETING);
    }
  }

  async unsubscribed(
    handle: ChannelHandle<CableIdentifiers>,
    params: MediaStreamChannelParams | null,
  ) {
    broadcastCallLog(handle.identifiers!.call_sid, 'system', 'Media stream stopped');
  }

  async handle_dtmf(
    handle: ChannelHandle<CableIdentifiers>,
    params: MediaStreamChannelParams | null,
    data: DTMFMessage,
  ) {
    console.log(`User pressed ${data.digit}`);
    broadcastCallLog(handle.identifiers!.call_sid, 'user', 'Pressed #' + data.digit);

    let period: "today" | "tomorrow" | "week" | undefined;

    switch (data.digit) {
      case "1":
        period = "today";
        break;
      case "2":
        period = "tomorrow";
        break;
      case "3":
        period = "week";
        break;
    };

    if (period) {
      broadcastCallLog(handle.identifiers!.call_sid, "assistant", `get_tasks({ period: "${period}" })`, { type: "function" });

      const tasks = await this.get_tasks({ period });

      let message!: string;

      if (tasks.length)
        message = `Here is what you have for ${period}: ${tasks.map((task) => task.title).join(", ")}`;
      else
        message = `You have no tasks for ${period}.`;

      this.transmit_message(handle, message)
    } else {
      this.transmit_message(handle, "I'm sorry, I didn't get that. Please try again.");
    }
  }

  async configure_openai(
    handle: ChannelHandle<CableIdentifiers>,
    params: MediaStreamChannelParams | null,
  ) {
    if (DISABLE_OPENAI_REALTIME) return;

    const tools = JSON.stringify(TOOLS);

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
    broadcastCallLog(handle.identifiers!.call_sid, data.role, data.text, {logId: data.id});
  }

  async handle_function_call(
    handle: ChannelHandle<CableIdentifiers>,
    params: MediaStreamChannelParams | null,
    data: { name: keyof ToolParameters; arguments: string },
  ) {
    console.log(`Call function ${data.name}(${data.arguments})`);

    broadcastCallLog(handle.identifiers!.call_sid, "assistant", `${data.name}(${data.arguments})`, { type: "function" });

    const args = JSON.parse(data.arguments);

    const result = await this[data.name](args);
    return this.reply(handle, "openai.function_call_result", result);
  }

  // Tools implementation
  async get_tasks({ period }: { period: "today" | "tomorrow" | "week" }) {
    const tasks = await tasksForPeriod(period);
    return tasks;
  }

  async create_task({
    date,
    description,
  }: {
    date: string;
    description: string;
  }) {
    const task = await createTask({
      title: description,
      completed: false,
      date,
    });

    return { status: "ok", task };
  }

  async complete_task({ id }: { id: number }) {
    const task = await updateTask(id, { completed: true });
    return { status: "ok" };
  }

  async delete_task({ id }: { id: number }) {
    await deleteTask(id);

    return { status: "ok" };
  }

  private async transmit_message(
    handle: ChannelHandle<CableIdentifiers>,
    message: string,
  ) {
    const base64Audio = await synthesizeAudio(message);

    broadcastCallLog(handle.identifiers!.call_sid, "assistant", message);

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
