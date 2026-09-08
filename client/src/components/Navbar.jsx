import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import Notification from "./Notification";

export default function Navbar() {
  const { user, logout, notifications, markNotificationAsRead, markAllAsRead } =
    useAuth();
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-gray-900 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* LEFT */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="text-xl font-bold hover:text-blue-400 transition"
          >
            Home
          </Link>

          {/* ✅ NEW CREATE BLOG BUTTON */}
          <Link to="/create" className="hover:text-purple-400 transition">
            + Create new Blog
          </Link>

          {user && (
            <>
              <Link
                to="/userdashboard/myblogs"
                className="hover:text-blue-400 transition"
              >
                MyBlog
              </Link>
            </>
          )}

          {user?.role === "admin" && (
            <Link
              to="/admindashboard"
              className="hover:text-purple-400 transition"
            >
              Admin Dashboard
            </Link>
          )}
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-6 relative">
          {!user && (
            <>
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition"
              >
                Register
              </Link>
            </>
          )}

          {user && (
            <>
              <Notification
                notifications={notifications}
                markNotificationAsRead={markNotificationAsRead}
                markAllAsRead={markAllAsRead}
              />

              {/* USER DROPDOWN */}
              <div className="relative">
                <button
                  onClick={() => setOpen((prev) => !prev)}
                  className="flex items-center gap-2 hover:text-purple-400 transition"
                >
                  <span className="font-medium">{user.name}</span>

                  <svg
                    className={`w-4 h-4 transition-transform ${
                      open ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
                    <Link
                      to="/edit-profile"
                      onClick={() => setOpen(false)}
                      className="block px-4 py-2 hover:bg-gray-700 transition"
                    >
                      Edit Profile
                    </Link>
                  </div>
                )}
              </div>

              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
