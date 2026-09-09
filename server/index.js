import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://localhost:5174",
  "https://blog-app-phi-sandy.vercel.app",
]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/", adminRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/blogs", blogRoutes);

app.get("/", (req, res) => {
  res.send("welcome Home sir");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`server is up and running on the port ${PORT}`);
});
