import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import CommentSection from "../components/CommentSection";
import { useBlogs } from "../context/BlogContext";
import { useAuth } from "../context/AuthContext";

const SingleBlog = () => {
  const { id } = useParams();
  const { toggleLike } = useBlogs();
  const { user } = useAuth();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/blogs/getblogbyid/${id}`);
        setBlog(res.data.blog);
      } catch (error) {
        console.error(error.response?.data || error.message);
        setBlog(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  const handleLike = async () => {
    if (!user) return;

    try {
      // Optimistic UI update
      const isLiked = blog.likes?.includes(user._id);
      const updatedLikes = isLiked
        ? blog.likes.filter((uid) => uid !== user._id)
        : [...(blog.likes || []), user._id];

      setBlog({ ...blog, likes: updatedLikes });

      // Call context function to sync with backend
      await toggleLike(blog._id);
    } catch (err) {
      console.error("Failed to toggle like", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-gray-400">
        Loading...
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-red-400">
        Blog Not Found!
      </div>
    );
  }

  const isLiked = blog.likes?.includes(user?._id);

  return (
    <div className="min-h-screen bg-gray-900 px-6 py-10 text-gray-100">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-700">
          <h1 className="text-4xl font-bold mb-4">{blog.title}</h1>

          <p className="text-gray-400 mb-4">
            By {blog.author?.name} {blog.author?.surname}
          </p>

          <div className="flex items-center gap-4 mb-4">
            {user && (
              <button
                onClick={handleLike}
                className={`px-4 py-2 rounded-lg text-white transition ${
                  isLiked
                    ? "bg-pink-500 hover:bg-pink-600"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                {isLiked ? "❤️ Unlike" : "🤍 Like"} ({blog.likes?.length || 0})
              </button>
            )}
          </div>

          <div className="text-gray-300 leading-relaxed whitespace-pre-line mt-2">
            {blog.content}
          </div>

          <div className="mt-6">
            <CommentSection blogId={blog._id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleBlog;
