import { useState, useCallback, useMemo } from "react";
import { useBlogs } from "../context/BlogContext";
import BlogCard from "../components/BlogCard";
import SearchBar from "../components/SearchBar";

const BLOGS_PER_PAGE = 10;

const Home = () => {
  const { blogs, loading } = useBlogs();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchFilters, setSearchFilters] = useState({});

  const filteredBlogs = useMemo(() => {
    let result = [...blogs];
    const { title, author, date, status } = searchFilters;

    if (title?.trim()) {
      result = result.filter((blog) =>
        blog.title?.toLowerCase().includes(title.toLowerCase()),
      );
    }
    if (author?.trim()) {
      result = result.filter((blog) =>
        `${blog.author?.name || ""} ${blog.author?.surname || ""}`
          .toLowerCase()
          .includes(author.toLowerCase()),
      );
    }
    if (date) {
      result = result.filter((blog) => blog.createdAt?.slice(0, 10) === date);
    }
    if (status?.trim()) {
      result = result.filter(
        (blog) => blog.status?.toLowerCase() === status.toLowerCase(),
      );
    }

    return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [blogs, searchFilters]);

  /* -------- Client-side Filtering -------- */
  const handleSearch = useCallback((filters) => {
    setSearchFilters(filters);
    setCurrentPage(1);
  }, []);

  const isSearching = Object.values(searchFilters).some(Boolean);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-gray-400">
        Loading...
      </div>
    );
  }

  if (!Array.isArray(blogs)) return null;

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

  return (
    <div className="min-h-screen bg-gray-900 px-6 py-10 text-gray-100">
      <div className="max-w-5xl mx-auto">
        {/* Search Bar */}
        <SearchBar onSearch={handleSearch} showStatus={true} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-end items-center gap-2 mb-8">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 text-sm rounded-lg transition ${
                currentPage === 1
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-gray-800 hover:bg-gray-700 text-gray-200"
              }`}
            >
              Prev
            </button>

            {Array.from({ length: totalPages }, (_, index) => {
              const page = index + 1;
              return (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`px-3 py-1 text-sm rounded-lg transition ${
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 hover:bg-gray-700 text-gray-200"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 text-sm rounded-lg transition ${
                currentPage === totalPages
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-gray-800 hover:bg-gray-700 text-gray-200"
              }`}
            >
              Next
            </button>
          </div>
        )}

        {/* Result Not Found */}
        {isSearching && filteredBlogs.length === 0 && (
          <div className="text-center text-red-400 py-10 text-lg font-semibold">
            Result Not Found
          </div>
        )}

        {/* Blog List */}
        <div className="space-y-10">
          {currentBlogs.map((blog) => (
            <BlogCard key={blog._id} blog={blog} showActions={false} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
