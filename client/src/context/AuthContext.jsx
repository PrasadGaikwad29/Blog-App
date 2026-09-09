import {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
} from "react";
import { loginUser } from "../services/authService";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const [notifications, setNotifications] = useState([]);

  /* ============================
     LOGIN
  ============================ */
  const login = async (credentials) => {
    const res = await loginUser(credentials);

    const loggedUser = res.data.user;
    const loggedToken = res.data.token;

    setUser(loggedUser);
    setToken(loggedToken);

    localStorage.setItem("user", JSON.stringify(loggedUser));
    localStorage.setItem("token", loggedToken);

    return loggedUser;
  };

  /* ============================
     LOGOUT
  ============================ */
  const logout = () => {
    setUser(null);
    setToken(null);
    setNotifications([]);

    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  /* ============================
     EDIT PROFILE
  ============================ */
  const editProfile = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  /* ============================
     FETCH NOTIFICATIONS
  ============================ */
  const fetchNotifications = useCallback(async () => {
    try {
      if (!token) return;

      const res = await api.get("/users/notifications");
      setNotifications(res.data.notifications || []);
    } catch (error) {
      console.error("Fetch notifications error:", error);
    }
  }, [token]);

  /* ============================
     MARK SINGLE NOTIFICATION AS READ
  ============================ */
  const markNotificationAsRead = async (id) => {
    try {
      await api.put(`/users/notifications/${id}`);

      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
    } catch (error) {
      console.error("Mark notification error:", error);
    }
  };

  /* ============================
     MARK ALL AS READ
  ============================ */
  const markAllAsRead = async () => {
    try {
      await api.put("/users/notifications/mark-all");

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Mark all error:", error);
    }
  };

  /* ============================
     AUTO FETCH AFTER LOGIN
  ============================ */
  useEffect(() => {
    if (user && token) {
      void Promise.resolve().then(fetchNotifications);
    }
  }, [user, token, fetchNotifications]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        editProfile,
        notifications,
        fetchNotifications,
        markNotificationAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
