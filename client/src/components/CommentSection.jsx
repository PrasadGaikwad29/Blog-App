import { useEffect, useState, useRef } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const CommentSection = ({ blogId, isAdmin = false }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");

  useEffect(() => {
    fetchComments();
  }, [blogId]);

  const fetchComments = async () => {
    try {
      const res = await api.get(`/blogs/getblogbyid/${blogId}`);
      setComments(res.data.blog.comments || []);
    } catch (error) {
      console.error(error);
    }
  };

  // Build nested tree
  const buildCommentTree = (comments) => {
    const map = {};
    const roots = [];

    comments.forEach((comment) => {
      map[comment._id] = { ...comment, replies: [] };
    });

    comments.forEach((comment) => {
      if (comment.parent) {
        map[comment.parent]?.replies.push(map[comment._id]);
      } else {
        roots.push(map[comment._id]);
      }
    });

    return roots;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await api.post(`/blogs/comment/${blogId}`, { text: content });
      setContent("");
      fetchComments();
    } catch (error) {
      console.error(error);
    }
  };

  const commentTree = buildCommentTree(comments);

  // =====================================
  // 🔥 Recursive Comment Component
  // =====================================
  const CommentItem = ({ comment, level = 0 }) => {
    const [replying, setReplying] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [showReplies, setShowReplies] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const hasReplies = comment.replies.length > 0;

    // Close admin dropdown on outside click
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
          setMenuOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    const handleReply = async (e) => {
      e.preventDefault();
      if (!replyText.trim()) return;

      try {
        await api.post(`/blogs/comment/${blogId}`, {
          text: replyText,
          parentId: comment._id,
        });
        setReplyText("");
        setReplying(false);
        fetchComments();
      } catch (error) {
        console.error(error);
      }
    };

    const handleDelete = async () => {
      try {
        await api.delete(
          `/blogs/admin/delete-comment/${blogId}/${comment._id}`,
        );
        fetchComments();
      } catch (error) {
        console.error(error);
      }
    };

    return (
      <div
        style={{
          marginLeft: level * 25,
          marginTop: 16,
          padding: 12,
          borderLeft: level > 0 ? "2px solid #ddd" : "none",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <strong>
            {comment.user?.name} {comment.user?.surname}
          </strong>

          {isAdmin && (
            <div ref={menuRef} style={{ position: "relative" }}>
              <span
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  cursor: "pointer",
                  padding: "0 6px",
                  fontSize: 18,
                }}
              >
                ⋮
              </span>

              {menuOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 22,
                    background: "white",
                    border: "1px solid #ddd",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    borderRadius: 4,
                    zIndex: 100,
                  }}
                >
                  <div
                    onClick={handleDelete}
                    style={{
                      padding: "8px 12px",
                      cursor: "pointer",
                      color: "red",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Delete
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Comment Text */}
        <p style={{ marginTop: 6 }}>{comment.text}</p>

        {/* Reply Button */}
        {user && (
          <button
            onClick={() => setReplying(!replying)}
            style={{
              background: "none",
              border: "none",
              color: "#007bff",
              cursor: "pointer",
              padding: 0,
              fontSize: 14,
            }}
          >
            Reply
          </button>
        )}

        {/* Reply Form */}
        {replying && (
          <form onSubmit={handleReply} style={{ marginTop: 10 }}>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              required
              style={{ width: "100%", minHeight: "60px" }}
            />
            <button type="submit" style={{ marginTop: 6 }}>
              Submit Reply
            </button>
          </form>
        )}

        {/* 🔥 View Replies Toggle */}
        {hasReplies && (
          <div style={{ marginTop: 6 }}>
            <button
              onClick={() => setShowReplies(!showReplies)}
              style={{
                background: "none",
                border: "none",
                color: "#6c757d",
                cursor: "pointer",
                padding: 0,
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              {showReplies
                ? "Hide replies"
                : `View replies (${comment.replies.length})`}
            </button>
          </div>
        )}

        {/* Nested Replies */}
        {hasReplies && showReplies && (
          <div style={{ marginTop: 10 }}>
            {comment.replies.map((reply) => (
              <CommentItem key={reply._id} comment={reply} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ marginTop: 20 }}>
      <h4>Comments</h4>

      {user && (
        <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            placeholder="Write a comment..."
            style={{ width: "100%", minHeight: "80px" }}
          />
          <button type="submit" style={{ marginTop: 8 }}>
            Post Comment
          </button>
        </form>
      )}

      {commentTree.length === 0 && <p>No comments yet.</p>}

      {commentTree.map((comment) => (
        <CommentItem key={comment._id} comment={comment} />
      ))}
    </div>
  );
};

export default CommentSection;
