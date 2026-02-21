import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import CommentSection from "../components/CommentSection";
import SearchBar from "../components/SearchBar";

const BLOGS_PER_PAGE = 10;

const MyBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const navigate = useNavigate();

  /* ---------------- Format Date ---------------- */
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

  /* ---------------- Fetch My Blogs ---------------- */
  const fetchMyBlogs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/blogs/myblogs");
      const data = res.data.blogs || [];

      const sorted = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );

      setBlogs(sorted);
      setFilteredBlogs(sorted);
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBlogs();
  }, []);

  /* ---------------- Client-side Search ---------------- */
  const handleSearch = useCallback(
    (filters) => {
      let result = [...blogs];

      if (filters.title?.trim()) {
        result = result.filter((blog) =>
          blog.title?.toLowerCase().includes(filters.title.toLowerCase()),
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
      setIsSearching(true);
    },
    [blogs],
  );

  /* ---------------- Delete Blog ---------------- */
  const deleteBlog = async (id) => {
    try {
      setDeletingId(id);

      await api.delete(`/blogs/deleteblog/${id}`);

      setBlogs((prev) => prev.filter((blog) => blog._id !== id));
      setFilteredBlogs((prev) => prev.filter((blog) => blog._id !== id));
    } catch (error) {
      console.error("Failed to delete blog:", error);
    } finally {
      setDeletingId(null);
    }
  };

  /* ---------------- Read More Toggle ---------------- */
  const toggleReadMore = (id) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  /* ---------------- Pagination ---------------- */
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

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gray-900 px-6 py-10 text-gray-100">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">My Blogs</h2>

          <button
            onClick={() => navigate("/create")}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-5 py-2 rounded-lg transition"
          >
            Create New Blog
          </button>
        </div>

        {/* Search Bar */}
        <SearchBar onSearch={handleSearch} showStatus={true} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-end items-center gap-2 mb-6">
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

        {/* Blog List */}
        <div className="space-y-8">
          {loading && (
            <div className="text-center text-gray-400 py-10">
              Loading blogs...
            </div>
          )}

          {!loading && isSearching && filteredBlogs.length === 0 && (
            <div className="text-center text-red-400 py-10 text-lg font-semibold">
              Result Not Found
            </div>
          )}

          {!loading && !isSearching && blogs.length === 0 && (
            <div className="text-center text-gray-400 py-10">
              No blogs available.
            </div>
          )}

          {currentBlogs.map((blog) => {
            const isExpanded = expanded[blog._id];
            const previewLength = 650;

            // Function to format content into paragraphs
            const renderContent = (content) =>
              content
                .slice(0, isExpanded ? content.length : previewLength)
                .split("\n")
                .map((line, index) => (
                  <p key={index} className="mb-2">
                    {line}
                  </p>
                ));

            return (
              <div
                key={blog._id}
                className="bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-700"
              >
                <h3 className="text-2xl font-semibold text-white mb-2">
                  {blog.title}
                </h3>

                {/* Author + Created Date */}
                <div className="flex justify-between items-center text-sm text-gray-400 mb-4">
                  <span>
                    By {blog.author?.name} {blog.author?.surname}
                  </span>
                  <span>{formatDate(blog.createdAt)}</span>
                </div>

                {/* Blog Content with Paragraphs */}
                <div className="text-gray-300 leading-relaxed">
                  {renderContent(blog.content)}

                  {blog.content.length > previewLength && (
                    <span
                      onClick={() => toggleReadMore(blog._id)}
                      className="text-blue-400 cursor-pointer hover:underline"
                    >
                      {isExpanded ? " Show Less" : "Read More..."}
                    </span>
                  )}
                </div>

                <p className="mt-4 text-sm text-gray-400">
                  Status:{" "}
                  <span className="text-gray-200 font-medium">
                    {blog.status}
                  </span>
                </p>

                <p className="mt-2 text-sm text-gray-400">
                  Likes ({blog.likes?.length || 0})
                </p>

                <div className="flex gap-4 mt-4">
                  <button
                    onClick={() => navigate(`/edit/${blog._id}`)}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm transition"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteBlog(blog._id)}
                    disabled={deletingId === blog._id}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm transition disabled:opacity-50"
                  >
                    {deletingId === blog._id ? "Deleting..." : "Delete"}
                  </button>
                </div>

                <div className="mt-6">
                  <CommentSection blogId={blog._id} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MyBlogs;
