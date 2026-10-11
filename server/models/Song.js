import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, trim: true, maxlength: 120 },
    story: { type: String, required: true, maxlength: 10000 },
    genre: { type: String, required: true, trim: true, maxlength: 60 },
    mood: { type: String, required: true, trim: true, maxlength: 60 },
    language: {
      type: String,
      required: true,
      default: "English",
      maxlength: 60,
    },
    notes: { type: String, maxlength: 2000 },
    lyrics: {
      title: { type: String, trim: true, maxlength: 120 },
      sections: [
        {
          type: { type: String, enum: ["verse", "chorus", "bridge", "outro"] },
          lines: [{ type: String, trim: true, maxlength: 500 }],
        },
      ],
    },
    audioUrl: String,
    stylePrompt: { type: String, maxlength: 1000 },
    coverImageUrl: String,
    status: {
      type: String,
      enum: ["pending", "generating_lyrics", "generating_audio", "ready", "failed"],
      default: "pending",
      index: true,
    },
    error: { type: String, maxlength: 500 },
  },
  { timestamps: true },
);
schema.index({ userId: 1, createdAt: -1 });
export const Song = mongoose.model("Song", schema);
