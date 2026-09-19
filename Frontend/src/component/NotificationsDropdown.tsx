import React, { useEffect, useState, useRef } from "react";
import { API, socket, connectSocket, disconnectSocket } from "../api/client";
import "../css/NotificationsDropdown.css";

export interface Notification {
  id: number;
  userId: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsDropdownProps {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

export default function NotificationsDropdown({
  notifications,
  setNotifications,
}: NotificationsDropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // ==============================
  // CLOSE ON CLICK OUTSIDE
  // ==============================
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ==============================
  // MARK ALL AS READ
  // ==============================
  const markAllAsRead = async () => {
    if (unreadCount === 0) return;

    // Optimistic Update
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true }))
    );

    try {
      await API.put("/notifications/read-all");
    } catch (err) {
      console.error("Failed to mark notifications read", err);
      // Revert if API fails (optional fetch refetch)
    }
  };

  // ==============================
  // MARK SINGLE AS READ
  // ==============================
  const markSingleAsRead = async (id: number, currentReadState: boolean) => {
    if (currentReadState) return;

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );

    try {
      await API.put(`/notifications/${id}/read`);
    } catch (err) {
      console.error(`Failed to mark notification ${id} as read`, err);
    }
  };

  // ==============================
  // SOCKET CONNECT & LISTENERS
  // ==============================
  useEffect(() => {
    connectSocket();

    socket.on("notification", (data: Notification) => {
      setNotifications((prev) => [data, ...prev]);
    });

    return () => {
      socket.off("notification");
      disconnectSocket();
    };
  }, [setNotifications]);

  return (
    <div className="notifications-container" ref={dropdownRef}>
      {/* 🔔 Button */}
      <button
        className={`notifications-toggle ${unreadCount > 0 ? "has-unread" : ""}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notifications"
      >
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="unread-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h4>Notifications</h4>
            {unreadCount > 0 && (
              <button className="mark-all-btn" onClick={markAllAsRead}>
                Mark all as read
              </button>
            )}
          </div>

          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="empty-notifications">
                <span>🔕</span>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`notification-item ${n.isRead ? "read" : "unread"}`}
                  onClick={() => markSingleAsRead(n.id, n.isRead)}
                >
                  <div className="notification-content">
                    <p className="notification-message">{n.message}</p>
                    <span className="notification-time">
                      {new Date(n.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {!n.isRead && <span className="unread-dot"></span>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}