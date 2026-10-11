import { Router } from "express";
import mongoose from "mongoose";
import { Bookmark } from "../models/Bookmark.js";
import { Song } from "../models/Song.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);
async function song(songId, userId) {
  return (
    mongoose.isValidObjectId(songId) && Song.findOne({ _id: songId, userId })
  );
}

router.post("/:songId", async (req, res, next) => {
  try {
    const owned = await song(req.params.songId, req.userId);
    if (!owned) return res.status(404).json({ error: "Song not found." });
    await Bookmark.updateOne(
      { userId: req.userId, songId: owned.id },
      { $setOnInsert: { userId: req.userId, songId: owned.id } },
      { upsert: true },
    );
    res.status(201).json({ bookmarked: true });
  } catch (e) {
    next(e);
  }
});

router.delete("/:songId", async (req, res, next) => {
  try {
    const owned = await song(req.params.songId, req.userId);
    if (!owned) return res.status(404).json({ error: "Song not found." });
    await Bookmark.deleteOne({ userId: req.userId, songId: owned.id });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});


router.get("/", async (req, res, next) => {
  try {
    const rows = await Bookmark.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .populate("songId")
      .lean();
    res.json({
      songs: rows
        .map((row) => ({ ...row.songId, bookmarked: true }))
        .filter(Boolean),
    });
  } catch (e) {
    next(e);
  }
});

export default router;
