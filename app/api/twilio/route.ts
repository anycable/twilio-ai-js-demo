import { type NextRequest } from 'next/server';

import { broadcastCallLog } from '@/server/cable';

const STREAM_URL = process.env.TWILIO_STREAM_CALLBACK || '';

export async function POST(request: NextRequest) {
  const data = await request.formData();

  const status = data.get('CallStatus');
  const callSid = data.get('CallSid');
  const from = data.get('From');
  const to = data.get('To');

  console.log(`Twilio call status=${status} callSid=${callSid} from=${from} to=${to}`);

  if (status === 'ringing' && STREAM_URL) {
    await broadcastCallLog(callSid as string, 'system', 'Ringing', { phoneNumber: from });

    const response = new Response(`
      <Response>
        <Connect>
          <Stream url="${STREAM_URL}" />
        </Connect>
      </Response>
    `, {
      headers: {
        'Content-Type': 'application/xml',
      },
      status: 200,
    });

    return response;
  }

  return new Response(null, {
    status: 200,
  });
}
