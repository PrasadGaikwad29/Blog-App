import { useCallback, useEffect, useState, useRef } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const CommentSection = ({ blogId, isAdmin = false, initialComments }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [showAllComments, setShowAllComments] = useState(true);

  const fetchComments = useCallback(async () => {
    if (!blogId) return;
    try {
      const res = await api.get(`/blogs/getblogbyid/${blogId}`);
      setComments(res.data.blog.comments || []);
    } catch (error) {
      console.error(error);
    }
  }, [blogId]);

  useEffect(() => {
    if (!blogId) return;
    if (initialComments) {
      setComments(initialComments);
      return;
    }
    void fetchComments();
  }, [blogId, initialComments, fetchComments]);

  // Build nested comment tree
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
    if (!content.trim() || !blogId) return;

    try {
      await api.post(`/blogs/comment/${blogId}`, { text: content });
      setContent("");
      fetchComments();
    } catch (error) {
      console.error(error);
    }
  };

  const commentTree = buildCommentTree(comments);

  const CommentItem = ({ comment, level = 0 }) => {
    const [replying, setReplying] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [showReplies, setShowReplies] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const hasReplies = comment.replies.length > 0;

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
      if (!replyText.trim() || !blogId) return;

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
      if (!blogId) return;
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
      <div className="mt-4" style={{ marginLeft: level * 24 }}>
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-200">
            {comment.user?.name} {comment.user?.surname}
          </span>

          {isAdmin && (
            <div ref={menuRef} className="relative">
              <span
                onClick={() => setMenuOpen(!menuOpen)}
                className="cursor-pointer px-2 text-gray-400 hover:text-white text-lg"
              >
                ⋮
              </span>

              {menuOpen && (
                <div className="absolute right-0 mt-2 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50">
                  <div
                    onClick={handleDelete}
                    className="px-4 py-2 text-sm text-red-400 hover:bg-gray-700 cursor-pointer whitespace-nowrap"
                  >
                    Delete
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <p className="mt-2 text-gray-300 text-sm leading-relaxed">
          {comment.text}
        </p>

        {user && (
          <button
            onClick={() => setReplying(!replying)}
            className="mt-2 text-sm text-blue-400 hover:underline"
          >
            Reply
          </button>
        )}

        {replying && (
          <form onSubmit={handleReply} className="mt-3">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              required
              className="w-full min-h-17.5 bg-gray-800 border border-gray-700 rounded-md p-3 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="mt-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-md text-white transition"
            >
              Submit Reply
            </button>
          </form>
        )}

        {hasReplies && (
          <div className="mt-2">
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="text-sm text-gray-400 hover:text-gray-200"
            >
              {showReplies
                ? "Hide replies"
                : `View replies (${comment.replies.length})`}
            </button>
          </div>
        )}

        {hasReplies && showReplies && (
          <div className="mt-3">
            {comment.replies.map((reply) => (
              <CommentItem key={reply._id} comment={reply} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mt-10">
      <h4 className="text-lg font-semibold text-white mb-4">Comments</h4>

      {user && (
        <form onSubmit={handleSubmit} className="mb-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            placeholder="Write a comment..."
            className="w-full min-h-22.5 bg-gray-800 border border-gray-700 rounded-md p-3 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="mt-3 px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white text-sm transition"
          >
            Post Comment
          </button>
        </form>
      )}

      {/* 🔥 Show / Hide All Comments Button */}
      {commentTree.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => setShowAllComments(!showAllComments)}
            className="text-sm text-gray-400 hover:text-gray-200"
          >
            {showAllComments
              ? "Hide all comments"
              : `Show all comments (${commentTree.length})`}
          </button>
        </div>
      )}

      {showAllComments && (
        <>
          {commentTree.length === 0 && (
            <p className="text-gray-400 text-sm">No comments yet.</p>
          )}

          {commentTree.map((comment) => (
            <CommentItem key={comment._id} comment={comment} />
          ))}
        </>
      )}
    </div>
  );
};

export default CommentSection;
