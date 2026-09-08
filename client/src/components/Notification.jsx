import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Notification({
  notifications,
  markNotificationAsRead,
  markAllAsRead,
}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Sort newest first (memoized)
  const sortedNotifications = useMemo(() => {
    return [...notifications].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
  }, [notifications]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  // ✅ FIXED: Navigation handled properly
  const handleNotificationClick = (notification) => {
    const blogId = notification.blogId;

    // Close dropdown immediately
    setOpen(false);

    // Navigate immediately (always works)
    if (blogId && notification.type !== "blog_deleted") {
      navigate(`/blogs/${blogId}`);
    }

    // Mark as read in background (no await)
    if (!notification.isRead) {
      markNotificationAsRead(notification._id);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative hover:text-yellow-400 transition"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-xs px-2 py-0.5 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
          <div className="px-4 py-2 border-b border-gray-700 font-semibold">
            <div className="flex items-center justify-between gap-3">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto">
            {sortedNotifications.length === 0 ? (
              <div className="p-4 text-gray-400 text-sm">No notifications</div>
            ) : (
              sortedNotifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleNotificationClick(n)}
                  className={`px-4 py-3 text-sm border-b border-gray-700 cursor-pointer transition ${
                    n.isRead ? "text-gray-400" : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  <div>{n.message}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
