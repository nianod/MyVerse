import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import auth from "./routes/auth.js";
import songs from "./routes/songs.js";
import bookmarks from "./routes/bookmarks.js";
import users from "./routes/users.js";
import { errors, notFound } from "./middleware/errors.js";
if (!process.env.MONGODB_URI || !process.env.JWT_SECRET)
  throw new Error("MONGODB_URI and JWT_SECRET must be configured.");
await mongoose.connect(process.env.MONGODB_URI).catch((error) => {
  console.error("MongoDB connection failed", { name: error.name });
  process.exit(1);
});
const app = express();
app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN?.split(",") || false,
    credentials: true,
  }),
);
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());
app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
  }),
  auth,
);
app.use("/api/songs", songs);
app.use("/api/bookmarks", bookmarks);
app.use("/api/users", users);
app.use(notFound);
app.use(errors);
app.listen(process.env.PORT || 4000, () => console.log("MyVerse API ready"));
