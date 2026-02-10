import express from "express";
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  getMyBlogs,
  getAllBlogsForAdmin,
  updateBlog,
  deleteBlog,
  addComment,
  toggleLike,
} from "../controllers/blogController.js";

import { auth, isAdmin } from "../middlewares/auth.js";

const router = express.Router();

/* =======================
   Public (Guest)
======================= */

// Home page → only published blogs
router.get("/getallblogs", getAllBlogs);

// Read single blog (publish OR author/admin)
router.get("/getblogbyid/:id", getBlogById);

/* =======================
   Authenticated User
======================= */

// Create blog (draft / review)
router.post("/createblog", auth, createBlog);

// User dashboard → own blogs
router.get("/myblogs", auth, getMyBlogs);

// Update own blog
router.put("/updateblog/:id", auth, updateBlog);

// Delete own blog
router.delete("/deleteblog/:id", auth, deleteBlog);

// Like / Unlike published blog
router.post("/like/:id", auth, toggleLike);

// Comment on published blog
router.post("/comment/:id", auth, addComment);

/* =======================
   Admin
======================= */

// Admin dashboard → all blogs (all statuses)
router.get("/admin/all", auth, isAdmin, getAllBlogsForAdmin);

export default router;
