import OpenAI from "openai";
import { WaveFile } from "wavefile";

export async function synthesizeAudio(text: string) {
  const openai = new OpenAI();

  const response = await openai.audio.speech.create({
    model: "tts-1-hd",
    voice: "fable",
    input: text,
    response_format: "wav",
  });

  console.log("Obtained audio from OpenAI")

  const buffer = await response.arrayBuffer();

  // now we need to convert it into musl for Twilio
  const wav = new WaveFile(new Uint8Array(buffer));
  wav.toBitDepth("8");
  wav.toSampleRate(8000);
  wav.toMuLaw();

  console.log("Converted audio to Twilio format")

  const payload = Buffer.from((wav.data as any).samples).toString("base64");

  return payload;
}
