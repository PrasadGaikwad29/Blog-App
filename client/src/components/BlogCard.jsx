import { useBlogs } from "../context/BlogContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const BlogCard = ({ blog, showActions = true }) => {
  const { removeBlog, toggleLike } = useBlogs();
  const { user } = useAuth();
  const navigate = useNavigate();

  const isAuthor = user?._id === blog.author?._id;
  const isAdmin = user?.role === "admin";
  const canModify = isAuthor || isAdmin;

  const isLiked = blog.likes?.includes(user?._id);

  // ✅ Format created date safely
  const formattedDate = blog.createdAt
    ? new Date(blog.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Unknown date";

  // ✅ Status color logic
  const statusColor =
    blog.status === "publish"
      ? "green"
      : blog.status === "review"
        ? "orange"
        : "gray";

  return (
    <div
      style={{
        borderBottom: "1px solid #ddd",
        marginBottom: 16,
        paddingBottom: 12,
      }}
    >
      {/* Title */}
      <h2
        style={{ cursor: "pointer" }}
        onClick={() => navigate(`/blogs/${blog._id}`)}
      >
        {blog.title}
      </h2>

      {/* Author */}
      <p style={{ fontSize: "14px", color: "#555" }}>
        By {blog.author?.name} {blog.author?.surname}
      </p>

      {/* Created Date */}
      <p style={{ fontSize: "13px", color: "#777" }}>📅 {formattedDate}</p>

      {/* Status (Show only in dashboard view) */}
      {showActions && (
        <p
          style={{
            fontSize: "13px",
            fontWeight: "bold",
            color: statusColor,
            marginBottom: 8,
          }}
        >
          Status: {blog.status}
        </p>
      )}

      {/* Content / Preview */}
      {!showActions ? (
        <p>
          {blog.content.slice(0, 150)}...
          <span
            style={{
              color: "blue",
              cursor: "pointer",
              marginLeft: 8,
            }}
            onClick={() => navigate(`/blogs/${blog._id}`)}
          >
            Read More
          </span>
        </p>
      ) : (
        <p>{blog.content}</p>
      )}

      {/* Like Button */}
      {user && (
        <p
          style={{ cursor: "pointer", marginTop: 8 }}
          onClick={() => toggleLike(blog._id)}
        >
          {isLiked ? "Unlike ❤️" : "❤️ Like"} ({blog.likes?.length || 0})
        </p>
      )}

      {/* Edit/Delete Buttons */}
      {showActions && canModify && (
        <div style={{ marginTop: 10 }}>
          <button
            onClick={() => navigate(`/edit/${blog._id}`)}
            style={{ marginRight: 8 }}
          >
            Edit
          </button>
          <button onClick={() => removeBlog(blog._id)}>Delete</button>
        </div>
      )}
    </div>
  );
};

export default BlogCard;
