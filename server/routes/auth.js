import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { User } from "../models/User.js";
import { cookieOptions, requireAuth, tokenFor } from "../middleware/auth.js";

const router = Router(),

  registration = z.object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().email(),
    passcode: z.string().min(10).max(128),
  }),
  login = z.object({
    email: z.string().trim().email(),
    passcode: z.string().min(1).max(128),
  });

const safe = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  avatarUrl: user.avatarUrl,
  createdAt: user.createdAt,
});

router.post("/register", async (req, res, next) => {
  try {
    const body = registration.parse(req.body);
    const email = body.email.toLowerCase();
    if (await User.exists({ email }))
      return res
        .status(409)
        .json({ error: "An account with that email already exists." });
    const user = await User.create({
      name: body.name,
      email,
      passwordHash: await bcrypt.hash(body.passcode, 12),
    });
    res
      .cookie("myverse_session", tokenFor(user), cookieOptions)
      .status(201)
      .json({ user: safe(user) });
  } catch (e) {
    next(e);
  }
});


router.post("/login", async (req, res, next) => {
  try {
    const body = login.parse(req.body);
    const user = await User.findOne({ email: body.email.toLowerCase() });
    if (!user || !(await bcrypt.compare(body.passcode, user.passwordHash)))
      return res.status(401).json({ error: "Invalid email or passcode." });
    res
      .cookie("myverse_session", tokenFor(user), cookieOptions)
      .json({ user: safe(user) });
  } catch (e) {
    next(e);
  }
});

router.post("/logout", (_req, res) =>
  res
    .clearCookie("myverse_session", { ...cookieOptions, maxAge: undefined })
    .status(204)
    .end(),
);

router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(401).json({ error: "Authentication required." });
  res.json({ user: safe(user) });
});
export default router;
