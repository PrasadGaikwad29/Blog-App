import React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import CommentSection from "../components/CommentSection";

const SingleBlog = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await api.get(`/blogs/getblogbyid/${id}`);
        setBlog(res.data.blog);
      } catch (error) {
        console.error(error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);
  if (loading) return <p>Loading...</p>;
  if (!blog) return <p>Blog Not Found!</p>;

  return (
    <div style={{ display: "flex", gap: "40px" }}>
      {/* Main Blog Area */}
      <div style={{ flex: 3 }}></div>
      <h1> {blog.title} </h1>

      <br />
      <br />

      <p style={{ color: "#555" }}>
        By {blog.author?.name} {blog.author?.surname}
      </p>
      <br />
      <br />

      <p>{blog.content}</p>
      <br />
      <br />

      <CommentSection blogId={blog._id} />
      <br />
      <br />

      <br />
      <br />
    </div>
  );
};

export default SingleBlog;
