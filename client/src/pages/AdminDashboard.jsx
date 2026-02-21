import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import CommentSection from "../components/CommentSection";
import SearchBar from "../components/SearchBar";

const BLOGS_PER_PAGE = 10;

const AdminDashboard = () => {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Track showMore state per blog
  const [showMoreState, setShowMoreState] = useState({});

  /* -------- Format Date -------- */
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* -------- Fetch All Blogs Once -------- */
  const fetchAllBlogs = async () => {
    try {
      const res = await api.get("/blogs/admin/all");
      const data = res.data.blogs || [];
      const sorted = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      setBlogs(sorted);
      setFilteredBlogs(sorted);
    } catch (error) {
      console.error("Failed to fetch blogs", error);
    }
  };

  useEffect(() => {
    fetchAllBlogs();
  }, []);

  /* -------- Client-side Filtering -------- */
  const handleSearch = useCallback(
    (filters) => {
      let result = [...blogs];
      if (filters.title?.trim()) {
        result = result.filter((blog) =>
          blog.title.toLowerCase().includes(filters.title.toLowerCase()),
        );
      }
      if (filters.author?.trim()) {
        result = result.filter((blog) =>
          `${blog.author?.name || ""} ${blog.author?.surname || ""}`
            .toLowerCase()
            .includes(filters.author.toLowerCase()),
        );
      }
      if (filters.date) {
        result = result.filter(
          (blog) => blog.createdAt?.slice(0, 10) === filters.date,
        );
      }
      if (filters.status?.trim()) {
        result = result.filter(
          (blog) => blog.status?.toLowerCase() === filters.status.toLowerCase(),
        );
      }
      setFilteredBlogs(result);
      setCurrentPage(1);
    },
    [blogs],
  );

  /* -------- Update Status -------- */
  const updateStatus = async (id, newStatus) => {
    try {
      setUpdatingId(id);
      await api.put(`/blogs/updateblog/${id}`, { status: newStatus });
      setBlogs((prev) =>
        prev.map((blog) =>
          blog._id === id ? { ...blog, status: newStatus } : blog,
        ),
      );
      setFilteredBlogs((prev) =>
        prev.map((blog) =>
          blog._id === id ? { ...blog, status: newStatus } : blog,
        ),
      );
    } catch (error) {
      console.error("Failed to update status", error);
    } finally {
      setUpdatingId(null);
    }
  };

  /* -------- Delete Blog -------- */
  const deleteBlog = async (id) => {
    try {
      setDeletingId(id);
      await api.delete(`/blogs/deleteblog/${id}`);
      setBlogs((prev) => prev.filter((blog) => blog._id !== id));
      setFilteredBlogs((prev) => prev.filter((blog) => blog._id !== id));
    } catch (error) {
      console.error("Failed to delete blog", error);
    } finally {
      setDeletingId(null);
    }
  };

  /* -------- Pagination -------- */
  const totalPages = Math.ceil(filteredBlogs.length / BLOGS_PER_PAGE);
  const startIndex = (currentPage - 1) * BLOGS_PER_PAGE;
  const currentBlogs = filteredBlogs.slice(
    startIndex,
    startIndex + BLOGS_PER_PAGE,
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* -------- Toggle Show More -------- */
  const toggleShowMore = (id) => {
    setShowMoreState((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="min-h-screen bg-gray-900 px-6 py-10 text-gray-100">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-6">Admin Dashboard</h2>

        <SearchBar onSearch={handleSearch} showStatus={true} />

        {totalPages > 1 && (
          <div className="flex gap-2 justify-end mb-6">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-800 rounded disabled:opacity-50"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => goToPage(i + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1 ? "bg-blue-600" : "bg-gray-800"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-800 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        <div className="space-y-8">
          {currentBlogs.map((blog) => {
            const isExpanded = showMoreState[blog._id];

            return (
              <div
                key={blog._id}
                className="bg-gray-800 rounded-2xl p-6 border border-gray-700"
              >
                <h3 className="text-xl font-semibold mb-2">{blog.title}</h3>

                {/* Author + Date */}
                <div className="flex justify-between text-sm text-gray-400 mb-4">
                  <span>
                    Author:{" "}
                    <span className="text-gray-200 font-medium">
                      {blog.author?.name} {blog.author?.surname}
                    </span>
                  </span>
                  <span>{formatDate(blog.createdAt)}</span>
                </div>

                {/* Blog Content */}
                <p className="text-gray-300 mb-2 whitespace-pre-line">
                  {isExpanded
                    ? blog.content
                    : `${blog.content.slice(0, 350)}${
                        blog.content.length > 350 ? "..." : ""
                      }`}
                </p>

                {/* Show More / Show Less */}
                {blog.content.length > 350 && (
                  <span
                    onClick={() => toggleShowMore(blog._id)}
                    className="text-blue-400 cursor-pointer hover:underline text-sm"
                  >
                    {isExpanded ? "Show Less" : "Show More"}
                  </span>
                )}

                {/* Status */}
                <div className="mt-5 flex items-center gap-4">
                  <label>Status:</label>
                  <select
                    value={blog.status}
                    onChange={(e) => updateStatus(blog._id, e.target.value)}
                    disabled={updatingId === blog._id}
                    className="bg-gray-700 px-3 py-2 rounded"
                  >
                    <option value="draft">Draft</option>
                    <option value="review">Review</option>
                    <option value="publish">Publish</option>
                  </select>
                </div>

                {/* Delete */}
                <button
                  onClick={() => deleteBlog(blog._id)}
                  disabled={deletingId === blog._id}
                  className="mt-5 bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
                >
                  {deletingId === blog._id ? "Deleting..." : "Delete Blog"}
                </button>

                {/* Comments */}
                <div className="mt-6">
                  <CommentSection blogId={blog._id} isAdmin />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
