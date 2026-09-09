import { createContext, useContext, useEffect, useState } from "react";
import {
  getBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleLikeBlog,
} from "../services/blogService";
import api from "../services/api";

const BlogContext = createContext();

export const BlogProvider = ({ children }) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await getBlogs();
      setBlogs(res.data.blogs || []);
    } catch (error) {
      console.error("Failed to fetch blogs", error);
    } finally {
      setLoading(false);
    }
  };

  const addBlog = async (data) => {
    const res = await createBlog(data);
    setBlogs((prev) => [res.data.blog, ...prev]);
  };
  const editBlog = async (id, data) => {
    const res = await updateBlog(id, data);
    setBlogs((prev) => prev.map((b) => (b._id === id ? res.data.blog : b)));
  };

  const removeBlog = async (id) => {
    await deleteBlog(id);
    setBlogs((prev) => prev.filter((blog) => blog._id !== id));
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const toggleLike = async (id) => {
    const res = await toggleLikeBlog(id);

    setBlogs((prev) =>
      prev.map((blog) => (blog._id === id ? res.data.blog : blog)),
    );
  };

  const fetchSingleBlog = async (id) => {
    const res = await api.get(`/blogs/getblogbyid/${id}`);
    return res.data.blog;
  };

  return (
    <BlogContext.Provider
      value={{
        blogs,
        loading,
        addBlog,
        editBlog,
        removeBlog,
        toggleLike,
        fetchSingleBlog,
        fetchBlogs,
      }}
    >
      {children}
    </BlogContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useBlogs = () => useContext(BlogContext);
