import React, { useEffect, useState } from "react";
import { API, socket, connectSocket, disconnectSocket } from "../api/client";

export interface Notification {
  id: number;
  userId: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}

function NotificationsDropdown({
  notifications,
  setNotifications,
}: {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}) {
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // ==============================
  // MARK ALL AS READ (FIXED)
  // ==============================
  const markAllAsRead = async () => {
    try {
      await API.put("/notifications/read-all"); // ✅ correct endpoint
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
    } catch (err) {
      console.error("Failed to mark notifications read", err);
    }
  };

  // ==============================
  // SOCKET CONNECT
  // ==============================
  useEffect(() => {
    connectSocket();

    return () => {
      disconnectSocket();
    };
  }, []);

  // ==============================
  // REAL-TIME LISTENER
  // ==============================
  useEffect(() => {
    socket.on("notification", (data: Notification) => {
      setNotifications((prev) => [data, ...prev]);
    });

    return () => {
      socket.off("notification");
    };
  }, [setNotifications]);

  return (
    <div style={{ position: "relative" }}>
      {/* 🔔 Button */}
      <button onClick={() => setOpen(!open)}>
        🔔 ({unreadCount})
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "40px",
            width: "300px",
            background: "#fff",
            border: "1px solid #ddd",
            padding: "10px",
            zIndex: 10,
          }}
        >
          <button onClick={markAllAsRead}>Mark all as read</button>

          {notifications.length === 0 ? (
            <p>No notifications</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: "8px",
                  background: n.isRead ? "#f9f9f9" : "#e6f7ff",
                  marginTop: "5px",
                  borderRadius: "4px",
                }}
              >
                {n.message}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationsDropdown;