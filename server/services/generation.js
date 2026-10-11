import fs from "node:fs/promises";
import path from "node:path";
import { Song } from "../models/Song.js";
import { generateLyrics } from "./lyricsService.js";
import { generateAudio } from "./audioService.js";

const audioDirectory = path.resolve(process.cwd(), "uploads", "audio");
const safeError = "We couldn't create this MyVerse just now. Please try again.";

 export function requestSongGeneration(song) {
  void processSong(song.id);
}

export async function processSong(songId) {
  const song = await Song.findById(songId);
  if (!song || song.status === "ready") return;
  try {
    song.status = "generating_lyrics";
    song.error = undefined;
    await song.save();
    const lyrics = await generateLyrics(song);
    song.title = song.title || lyrics.title;
    song.lyrics = { title: lyrics.title, sections: lyrics.sections };
    song.stylePrompt = lyrics.stylePrompt;
    song.status = "generating_audio";
    await song.save();

    const audio = await generateAudio(song);
    if (audio) {
      await fs.mkdir(audioDirectory, { recursive: true });
      const extension = audio.mimeType.includes("wav") ? "wav" : "mp3";
      await fs.writeFile(path.join(audioDirectory, `${song.id}.${extension}`), audio.buffer);
      song.audioUrl = `/uploads/audio/${song.id}.${extension}`;
    }
    song.status = "ready";
    await song.save();
    console.info("Song generation complete", { songId: song.id, status: song.status });
  } catch (error) {
    const current = await Song.findById(songId);
    if (current) {
      current.status = "failed";
      current.error = safeError;
      await current.save();
    }
    console.error("Song generation failed", { songId, code: error?.status || error?.code || error?.name });
  }
}

export async function failStuckSongs() {
  const cutoff = new Date(Date.now() - 10 * 60 * 1000);
  const result = await Song.updateMany(
    { status: { $in: ["generating_lyrics", "generating_audio"] }, updatedAt: { $lt: cutoff } },
    { $set: { status: "failed", error: safeError } },
  );
  if (result.modifiedCount) console.info("Stale song jobs marked failed", { count: result.modifiedCount });
}
