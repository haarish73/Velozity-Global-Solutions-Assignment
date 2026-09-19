import { useEffect, useState, useRef } from "react";
import { API } from "../api/client";
import "../css/NotificationDropdown.css"; // Make sure to import the CSS file

type Notification = {
  id: number;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await API.get("/notifications");
      console.log("TOKEN:", localStorage.getItem("token"));
      console.log("API RESPONSE:", res.data);
      setNotifications(res.data.data || []);
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };

  // Mark single notification as read
  const markAsRead = async (id: number, isRead: boolean) => {
    if (isRead) return; // Prevent extra API calls if already read

    // Optimistic UI Update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );

    try {
      await API.post(`/notifications/${id}/read`);
    } catch (err) {
      console.error("Failed to mark notification as read", err);
      // Rollback on failure
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: false } : n))
      );
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    const hasUnread = notifications.some((n) => !n.isRead);
    if (!hasUnread) return;

    // Store state backup for rollback if request fails
    const previousState = [...notifications];

    // Optimistic UI Update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

    try {
      await API.post("/notifications/mark-read");
    } catch (err) {
      console.error("Failed to mark all notifications as read", err);
      setNotifications(previousState);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="notification-container" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
  className="notification-trigger-btn"
  onClick={() => {
    setOpen((prev) => {
      if (!prev) fetchNotifications(); // 🔥 fetch when opening
      return !prev;
    });
  }}
>
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h4>Notifications</h4>
            {unreadCount > 0 && (
              <button className="mark-all-btn" onClick={markAllAsRead}>
                Mark all as read
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <p className="empty-notifications">No notifications found.</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`notification-item ${n.isRead ? "read" : "unread"}`}
                  onClick={() => markAsRead(n.id, n.isRead)}
                >
                  {!n.isRead && <span className="unread-dot"></span>}
                  <div className="notification-content">
                    <p className="notification-message">{n.message}</p>
                    <small className="notification-time">
                      {new Date(n.createdAt).toLocaleString()}
                    </small>
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