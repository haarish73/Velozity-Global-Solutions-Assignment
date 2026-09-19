import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { API } from "../api/client";
import { useAuth } from "../context/AuthContext";
import Tasks from "./Tasks";
import NotificationsDropdown from "../component/NotificationsDropdown";
import type { Notification } from "../component/NotificationsDropdown";
import "../css/Dashboard.css";

type Task = {
  id: number;
  title: string;
  status: string;
  priority: string;
  dueDate: string;
};

type Project = {
  id: number;
  name: string;
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Active section state ("dashboard" or "tasks")
  const [activeSection, setActiveSection] = useState<"dashboard" | "tasks">("dashboard");

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // Notification State
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [statusCount, setStatusCount] = useState<Record<string, number>>({});
  const [priorityCount, setPriorityCount] = useState<Record<string, number>>({});
  const [overdueCount, setOverdueCount] = useState(0);

 
  // AUTH REDIRECT GUARD
 
  useEffect(() => {
    if (!loading && !user) {
      navigate("/", { replace: true });
    }
  }, [user, loading, navigate]);

 
  // FETCH DATA
 
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch tasks, projects, and notifications in parallel
      const [taskRes, projectRes, notificationRes] = await Promise.allSettled([
        API.get("/tasks"),
        API.get("/projects"),
        API.get("/notifications"),
      ]);

      const taskData =
        taskRes.status === "fulfilled" ? taskRes.value.data.data || [] : [];
      const projectData =
        projectRes.status === "fulfilled" ? projectRes.value.data.data || [] : [];
      const notificationData =
        notificationRes.status === "fulfilled"
          ? notificationRes.value.data.data || notificationRes.value.data || []
          : [];

      setTasks(taskData);
      setProjects(projectData);
      setNotifications(notificationData);

      calculateStats(taskData);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error Loading Data",
        text: "Failed to load dashboard data. Please try again later.",
      });
    }
  };

 
  // LOGOUT HANDLER WITH SWAL
 
  const handleLogout = () => {
    Swal.fire({
      title: "Logout Confirmation",
      text: "Are you sure you want to log out?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        Swal.fire({
          icon: "success",
          title: "Logged Out",
          text: "You have been successfully logged out.",
          timer: 1500,
          showConfirmButton: false,
        });
        navigate("/", { replace: true });
      }
    });
  };

 
  // CALCULATIONS & STATS
 
  const calculateStats = (tasksList: Task[]) => {
    const status: Record<string, number> = {};
    const priority: Record<string, number> = {};
    let overdue = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    tasksList.forEach((t) => {
      status[t.status] = (status[t.status] || 0) + 1;
      priority[t.priority] = (priority[t.priority] || 0) + 1;

      const taskDueDate = new Date(t.dueDate);
      if (taskDueDate < today && t.status !== "DONE") {
        overdue++;
      }
    });

    setStatusCount(status);
    setPriorityCount(priority);
    setOverdueCount(overdue);
  };

  const getBadgeClass = (value: string) => {
    const val = value.toUpperCase();
    if (val === "CRITICAL" || val === "HIGH") return "badge badge-danger";
    if (val === "MEDIUM" || val === "IN_PROGRESS") return "badge badge-warning";
    if (val === "DONE" || val === "LOW") return "badge badge-success";
    return "badge badge-default";
  };

 
  // ADMIN DASHBOARD VIEW
 
  const AdminView = () => (
    <div className="dashboard-view">
      <header className="dashboard-header">
        <h2>Admin Dashboard</h2>
      </header>

      <section className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Projects</span>
          <span className="stat-value">{projects.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Tasks</span>
          <span className="stat-value">{tasks.length}</span>
        </div>
        <div className="stat-card highlight-danger">
          <span className="stat-label">Overdue Tasks</span>
          <span className="stat-value">{overdueCount}</span>
        </div>
      </section>

      <section className="dashboard-section">
        <h3>Task Status Breakdown</h3>
        <ul className="status-list">
          {Object.keys(statusCount).length === 0 ? (
            <p className="empty-msg">No status data available.</p>
          ) : (
            Object.keys(statusCount).map((key) => (
              <li key={key} className="status-item">
                <span className={getBadgeClass(key)}>{key}</span>
                <span className="status-count">{statusCount[key]}</span>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );

 
  // PM DASHBOARD VIEW (FIXED DATES)
 
  const PMView = () => {
    const upcomingTasks = tasks.filter((t) => {
      if (!t.dueDate) return false;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      nextWeek.setHours(23, 59, 59, 999);

      const taskDueDate = new Date(t.dueDate);

      return taskDueDate >= today && taskDueDate <= nextWeek;
    });

    return (
      <div className="dashboard-view">
        <header className="dashboard-header">
          <h2>Project Manager Dashboard</h2>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">My Projects</span>
            <span className="stat-value">{projects.length}</span>
          </div>
        </section>

        <section className="dashboard-section">
          <h3>Tasks by Priority</h3>
          <div className="priority-grid">
            {Object.keys(priorityCount).length === 0 ? (
              <p className="empty-msg">No priority data available.</p>
            ) : (
              Object.keys(priorityCount).map((key) => (
                <div key={key} className="priority-card">
                  <span className={getBadgeClass(key)}>{key}</span>
                  <span className="priority-count">{priorityCount[key]}</span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="dashboard-section">
          <h3>Upcoming Tasks (This Week)</h3>
          {upcomingTasks.length === 0 ? (
            <p className="empty-msg">No upcoming tasks due in the next 7 days.</p>
          ) : (
            <ul className="upcoming-list">
              {upcomingTasks.map((t) => {
                const formattedDate = new Date(t.dueDate).toLocaleDateString(
                  undefined,
                  {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  }
                );

                return (
                  <li key={t.id} className="upcoming-item">
                    <span className="task-title">{t.title}</span>
                    <time className="task-date">📅 {formattedDate}</time>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    );
  };

 
  // DEV DASHBOARD VIEW
 
  const DevView = () => {
    const sortedTasks = [...tasks].sort((a, b) => {
      const priorityOrder = {
        CRITICAL: 4,
        HIGH: 3,
        MEDIUM: 2,
        LOW: 1,
      };

      const pDiff =
        (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) -
        (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);

      if (pDiff !== 0) return pDiff;

      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    return (
      <div className="dashboard-view">
        <header className="dashboard-header">
          <h2>My Tasks Summary</h2>
        </header>

        <section className="dashboard-section">
          {sortedTasks.length === 0 ? (
            <p className="empty-msg">No tasks assigned to you.</p>
          ) : (
            <div className="task-list">
              {sortedTasks.map((t) => (
                <article key={t.id} className="task-card">
                  <div className="task-info">
                    <h4 className="task-title">{t.title}</h4>
                    <span className="task-date-sub">
                      Due:{" "}
                      {new Date(t.dueDate).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="task-tags">
                    <span className={getBadgeClass(t.priority)}>{t.priority}</span>
                    <span className={getBadgeClass(t.status)}>{t.status}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    );
  };

 
  // RENDER STATES
 

  // 1. Show spinner while verifying user session on reload
  if (loading) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  // 2. Prevent rendering before redirection occurs
  if (!user) {
    return null;
  }

  // 3. Render Dashboard once authenticated
  return (
    <div className="dashboard-wrapper">
      {/* Top Navbar */}
      <nav className="top-navbar">
        <div className="navbar-left">
          <div className="navbar-brand">
            <span className="brand-logo">📊</span>
            <span className="brand-title">Project Hub</span>
          </div>

          <div className="nav-links">
            <button
              className={`nav-link-btn ${
                activeSection === "dashboard" ? "active" : ""
              }`}
              onClick={() => setActiveSection("dashboard")}
            >
              Dashboard
            </button>
            <button
              className={`nav-link-btn ${
                activeSection === "tasks" ? "active" : ""
              }`}
              onClick={() => setActiveSection("tasks")}
            >
              Tasks
            </button>
          </div>
        </div>

        <div className="navbar-actions">
          {/* Notifications Dropdown */}
          <NotificationsDropdown
            notifications={notifications}
            setNotifications={setNotifications}
          />
          <span className="user-role-badge">{user.role}</span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content Render */}
      <main className="dashboard-content">
        {activeSection === "dashboard" && (
          <>
            {user.role === "ADMIN" && <AdminView />}
            {user.role === "PM" && <PMView />}
            {user.role === "DEV" && <DevView />}
          </>
        )}

        {activeSection === "tasks" && <Tasks />}
      </main>
    </div>
  );
}