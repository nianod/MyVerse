import { Router } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { Song } from "../models/Song.js";
import { Bookmark } from "../models/Bookmark.js";
import { requireAuth } from "../middleware/auth.js";
import { requestSongGeneration } from "../services/generation.js";
import rateLimit from "express-rate-limit";
const router = Router();
router.use(requireAuth);
const createSchema = z.object({
  title: z.string().trim().max(120).optional(),
  story: z.string().trim().min(50).max(3000),
  genre: z.enum(["Afrobeat", "Rap", "Gospel", "R&B", "Pop", "Acoustic"]),
  mood: z.enum(["nostalgic", "hopeful", "joyful", "reflective", "heartbreak", "empowered"]),
  language: z.enum(["English", "Swahili", "Sheng", "Kikuyu", "Luo", "Arabic"]).default("English"),
  notes: z.string().trim().max(2000).optional(),
});
const patchSchema = z.object({ title: z.string().trim().min(1).max(120) });
const owned = (id, userId) => Song.findOne({ _id: id, userId });
const creationLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => String(req.userId),
  message: { error: "You can create up to 5 MyVerses per hour. Please try again later." },
});
router.post("/", creationLimit, async (req, res, next) => {
  try {
    const song = await Song.create({
      ...createSchema.parse(req.body),
      userId: req.userId,
      status: "pending",
    });
    requestSongGeneration(song);
    res.status(201).json({ song });
  } catch (e) {
    next(e);
  }
});
router.post("/:songId/retry", async (req, res, next) => {
  try {
    const song = await owned(req.params.songId, req.userId);
    if (!song) return res.status(404).json({ error: "Song not found." });
    if (song.status !== "failed")
      return res.status(409).json({ error: "Only failed MyVerses can be retried." });
    song.status = "pending";
    song.error = undefined;
    song.audioUrl = undefined;
    await song.save();
    requestSongGeneration(song);
    res.json({ song });
  } catch (e) {
    next(e);
  }
});
router.get("/", async (req, res, next) => {
  try {
    const {
      page = "1",
      limit = "24",
      search = "",
      genre,
      mood,
      status,
      sort = "newest",
    } = req.query;
    const filter = {
      userId: req.userId,
      ...(genre ? { genre } : {}),
      ...(mood ? { mood } : {}),
      ...(status ? { status } : {}),
      ...(search
        ? {
            title: {
              $regex: String(search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
              $options: "i",
            },
          }
        : {}),
    };
    const [songs, total, bookmarked] = await Promise.all([
      Song.find(filter)
        .sort({ createdAt: sort === "oldest" ? 1 : -1 })
        .skip((Math.max(1, Number(page)) - 1) * Math.min(100, Number(limit)))
        .limit(Math.min(100, Number(limit)))
        .lean(),
      Song.countDocuments(filter),
      Bookmark.find({ userId: req.userId }).select("songId").lean(),
    ]);
    const ids = new Set(bookmarked.map((item) => String(item.songId)));
    res.json({
      songs: songs.map((song) => ({
        ...song,
        bookmarked: ids.has(String(song._id)),
      })),
      total,
      page: Number(page),
    });
  } catch (e) {
    next(e);
  }
});
router.get("/:songId", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.songId))
      return res.status(404).json({ error: "Song not found." });
    const song = await owned(req.params.songId, req.userId).lean();
    if (!song) return res.status(404).json({ error: "Song not found." });
    res.json({
      song,
      bookmarked: Boolean(
        await Bookmark.exists({ userId: req.userId, songId: song._id }),
      ),
    });
  } catch (e) {
    next(e);
  }
});
router.patch("/:songId", async (req, res, next) => {
  try {
    const song = await owned(req.params.songId, req.userId);
    if (!song) return res.status(404).json({ error: "Song not found." });
    Object.assign(song, patchSchema.parse(req.body));
    await song.save();
    res.json({ song });
  } catch (e) {
    next(e);
  }
});
router.delete("/:songId", async (req, res, next) => {
  try {
    const song = await owned(req.params.songId, req.userId);
    if (!song) return res.status(404).json({ error: "Song not found." });
    await Bookmark.deleteMany({ songId: song._id });
    await song.deleteOne();
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});
export default router;
