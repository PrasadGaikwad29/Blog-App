import { useParams, useNavigate } from "react-router-dom";
import { useBlogs } from "../context/BlogContext";
import { useState, useEffect } from "react";

const EditBlog = () => {
  const { id } = useParams();
  const { blogs, editBlog, fetchSingleBlog } = useBlogs();
  const navigate = useNavigate();

  const existingBlog = blogs.find((b) => b._id === id);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("draft");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBlog = async () => {
      let blog = existingBlog;
      if (!blog) {
        blog = await fetchSingleBlog(id);
      }
      if (blog) {
        setTitle(blog.title);
        setContent(blog.content);
        setStatus(blog.status);
      }
      setLoading(false);
    };
    loadBlog();
  }, [id, existingBlog, fetchSingleBlog]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await editBlog(id, { title, content, status });
    navigate("/userdashboard/myblogs");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex justify-center items-start px-6 py-12 text-gray-100">
      <div className="w-full max-w-2xl bg-gray-800 border border-gray-700 rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-8 text-white">Edit Blog</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="w-full min-h-45 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="publish">Publish</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="px-6 py-3 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition"
            >
              Update
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-lg text-sm font-medium bg-gray-700 hover:bg-gray-600 text-gray-200 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBlog;
