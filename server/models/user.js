import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    surname: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },

    // ✅ ADD THESE
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },

    blogs: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Blog",
      default: [],
    },
    notifications: [
      {
        message: { type: String, required: true },
        blogId: { type: mongoose.Schema.Types.ObjectId, ref: "Blog" },
        type: {
          type: String,
          enum: ["status_changed", "blog_deleted", "comment_deleted"],
          required: true,
        },
        isRead: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
