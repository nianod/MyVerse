import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { User } from "../models/User.js";
import { Song } from "../models/Song.js";
import { Bookmark } from "../models/Bookmark.js";
import { requireAuth } from "../middleware/auth.js";
const router = Router();
router.use(requireAuth);
const safe = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  avatarUrl: u.avatarUrl,
  createdAt: u.createdAt,
});
router.get("/me", async (req, res, next) => {
  try {
    const [user, songs, bookmarks] = await Promise.all([
      User.findById(req.userId),
      Song.countDocuments({ userId: req.userId }),
      Bookmark.countDocuments({ userId: req.userId }),
    ]);
    if (!user)
      return res.status(401).json({ error: "Authentication required." });
    res.json({ user: safe(user), stats: { songs, bookmarks } });
  } catch (e) {
    next(e);
  }
});
router.patch("/me", async (req, res, next) => {
  try {
    const body = z
      .object({ name: z.string().trim().min(2).max(80) })
      .parse(req.body);
    const user = await User.findByIdAndUpdate(req.userId, body, { new: true });
    res.json({ user: safe(user) });
  } catch (e) {
    next(e);
  }
});
router.patch("/me/passcode", async (req, res, next) => {
  try {
    const body = z
      .object({
        currentPasscode: z.string(),
        newPasscode: z.string().min(10).max(128),
      })
      .parse(req.body);
    const user = await User.findById(req.userId);
    if (
      !user ||
      !(await bcrypt.compare(body.currentPasscode, user.passwordHash))
    )
      return res.status(400).json({ error: "Current passcode is incorrect." });
    user.passwordHash = await bcrypt.hash(body.newPasscode, 12);
    await user.save();
    res.status(204).end();
  } catch (e) {
    next(e);
  }
})


router.delete("/me", async (req, res, next) => {
  try {
    const body = z.object({ passcode: z.string() }).parse(req.body);
    const user = await User.findById(req.userId);
    if (!user || !(await bcrypt.compare(body.passcode, user.passwordHash)))
      return res.status(400).json({ error: "Passcode is incorrect." });
    const songIds = await Song.find({ userId: user.id }).distinct("_id");
    await Bookmark.deleteMany({
      $or: [{ userId: user.id }, { songId: { $in: songIds } }],
    });
    await Song.deleteMany({ userId: user.id });
    await user.deleteOne();
    res.clearCookie("myverse_session").status(204).end();
  } catch (e) {
    next(e);
  }
});
export default router;
