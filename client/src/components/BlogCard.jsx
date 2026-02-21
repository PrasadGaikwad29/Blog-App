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

  const formattedDate = blog.createdAt
    ? new Date(blog.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Unknown date";

  const statusColor =
    blog.status === "publish"
      ? "text-emerald-400"
      : blog.status === "review"
        ? "text-amber-400"
        : "text-gray-400";

return (
  <div className="w-full">
    <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-lg p-6 transition hover:shadow-xl hover:border-gray-600">
      {/* Title */}
      <h2
        onClick={() => navigate(`/blogs/${blog._id}`)}
        className="text-2xl font-semibold text-white cursor-pointer hover:text-blue-400 transition"
      >
        {blog.title}
      </h2>

      {/* Author */}
      <p className="text-sm text-gray-400 mt-2">
        By{" "}
        <span className="text-gray-200 font-medium">
          {blog.author?.name} {blog.author?.surname}
        </span>
      </p>

      {/* Date */}
      <p className="text-xs text-gray-500 mt-1">{formattedDate}</p>

      {/* Status */}
      {showActions && (
        <p className={`text-xs font-semibold mt-2 ${statusColor}`}>
          Status: {blog.status}
        </p>
      )}

      {/* Content */}
      <div className="mt-4 text-gray-300 leading-relaxed text-sm">
        {!showActions ? (
          <>
            {blog.content.slice(0, 650)}...
            <span
              onClick={() => navigate(`/blogs/${blog._id}`)}
              className="ml-2 text-blue-400 cursor-pointer hover:underline"
            >
              Read More
            </span>
          </>
        ) : (
          blog.content
        )}
      </div>

      {/* Like Button */}
      {user && (
        <div
          onClick={() => toggleLike(blog._id)}
          className="mt-5 text-sm text-gray-400 cursor-pointer hover:text-pink-400 transition"
        >
          {isLiked ? "❤️ Unlike" : "🤍 Like"}{" "}
          <span className="text-gray-500">({blog.likes?.length || 0})</span>
        </div>
      )}

      {/* Actions */}
      {showActions && canModify && (
        <div className="mt-6 flex gap-4">
          <button
            onClick={() => navigate(`/edit/${blog._id}`)}
            className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
          >
            Edit
          </button>

          <button
            onClick={() => removeBlog(blog._id)}
            className="px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-700 text-white transition"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  </div>
);
};

export default BlogCard;
