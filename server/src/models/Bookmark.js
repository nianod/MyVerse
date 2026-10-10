import mongoose from "mongoose";
const schema = new mongoose.Schema({ userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, songId: { type: mongoose.Schema.Types.ObjectId, ref: "Song", required: true } }, { timestamps: true });
schema.index({ userId: 1, songId: 1 }, { unique: true }); schema.index({ userId: 1, createdAt: -1 });
export const Bookmark = mongoose.model("Bookmark", schema);
