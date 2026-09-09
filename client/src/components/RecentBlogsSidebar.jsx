import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBlogs } from "../context/BlogContext";

const RecentBlogsSidebar = ({
  currentBlogId,
  blogs: providedBlogs,
  includeUnpublished = false,
}) => {
  const navigate = useNavigate();
  const { blogs: contextBlogs } = useBlogs();
  const [open, setOpen] = useState(true);
  const blogs = providedBlogs || contextBlogs;

  const recentBlogs = useMemo(() => {
    if (!Array.isArray(blogs)) return [];

    return [...blogs]
      .filter((blog) => {
        if (!blog?._id || blog._id === currentBlogId) return false;
        return includeUnpublished || blog.status === "publish";
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 12);
  }, [blogs, currentBlogId, includeUnpublished]);

  if (!recentBlogs.length) return null;

  return (
    <div className="relative flex w-full justify-end lg:sticky lg:top-6 lg:self-start">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`absolute top-3 z-10 rounded-md border border-cyan-500/40 bg-cyan-600 px-2.5 py-1.5 text-sm font-bold text-white shadow-md transition-all duration-300 hover:bg-cyan-500 ${
          open ? "right-3" : "right-0"
        }`}
        aria-label={open ? "Hide recent posts" : "Show recent posts"}
      >
        {open ? "→" : "←"}
      </button>

      <aside
        className={`overflow-hidden rounded-xl border bg-gray-800 shadow-xl transition-[width,opacity] duration-300 ${
          open
            ? "w-full border-gray-700 opacity-100"
            : "w-0 border-transparent opacity-0 shadow-none"
        }`}
      >
        <div className="whitespace-nowrap border-b border-gray-700 bg-gray-800 px-5 py-4 pr-14">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-400">
            Explore
          </p>
          <h3 className="mt-1 text-lg font-bold text-white">
            Recently Published
          </h3>
        </div>

        <div className="max-h-[calc(100vh-10rem)] overflow-y-auto p-3 [scrollbar-color:#0891b2_#1f2937] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-cyan-600 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-700">
          <div className="space-y-1">
            {recentBlogs.map((blog) => (
              <button
                key={blog._id}
                type="button"
                onClick={() => {
                  navigate(`/blogs/${blog._id}`);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="block w-full rounded-lg border border-transparent px-3 py-2.5 text-left text-sm leading-5 text-gray-300 transition hover:border-cyan-500/40 hover:bg-gray-700 hover:text-cyan-300"
              >
                {blog.title}
              </button>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default RecentBlogsSidebar;
