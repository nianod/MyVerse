import Groq from "groq-sdk";

const supportedLanguages = new Set(["English", "Arabic"]);
const maxCharacters = 4000;
const flattenLyrics = (lyrics) => lyrics.sections.map((section) => `[${section.type}]\n${section.lines.join("\n")}`);

function chunkSections(sections) {
  const chunks = [];
  let chunk = "";
  for (const section of sections) {
    if (section.length > maxCharacters) throw new Error("LYRICS_TOO_LONG_FOR_TTS");
    if (`${chunk}\n\n${section}`.length > maxCharacters) {
      if (chunk) chunks.push(chunk);
      chunk = section;
    } else chunk = chunk ? `${chunk}\n\n${section}` : section;
  }
  if (chunk) chunks.push(chunk);
  return chunks;
}

function joinWavBuffers(buffers) {
  if (buffers.length === 1) return buffers[0];
  const header = Buffer.from(buffers[0].subarray(0, 44));
  const data = buffers.map((buffer) => buffer.subarray(44));
  const dataLength = data.reduce((sum, buffer) => sum + buffer.length, 0);
  header.writeUInt32LE(36 + dataLength, 4);
  header.writeUInt32LE(dataLength, 40);
  return Buffer.concat([header, ...data]);
}

export async function generateNarration({ lyricsText, language }) {
  if (!supportedLanguages.has(language)) return null;
  if (!process.env.GROQ_API_KEY) throw new Error("GROQ_NOT_CONFIGURED");
  const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const buffers = await Promise.all(lyricsText.map(async (input) => {
    const response = await client.audio.speech.create({
      model: process.env.GROQ_TTS_MODEL || "canopylabs/orpheus-v1-english",
      voice: process.env.GROQ_TTS_VOICE || "hannah",
      input,
      response_format: "wav",
    });
    return Buffer.from(await response.arrayBuffer());
  }));
  return joinWavBuffers(buffers);
}

// A narrow provider boundary: replace this function when a real music provider is added.
export async function generateAudio(song) {
  if (!supportedLanguages.has(song.language)) return null;
  if (!process.env.GROQ_API_KEY) throw new Error("GROQ_NOT_CONFIGURED");
  const buffer = await generateNarration({ lyricsText: chunkSections(flattenLyrics(song.lyrics)), language: song.language });
  return buffer ? { buffer, mimeType: "audio/wav" } : null;
}
