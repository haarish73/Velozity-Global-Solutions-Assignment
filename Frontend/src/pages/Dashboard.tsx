import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // 1. Import useNavigate
import { API } from "../api/client";
import { useAuth } from "../context/AuthContext";
import Tasks from "./Tasks";
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
  const navigate = useNavigate(); // 2. Initialize navigate hook

  // Active section state ("dashboard" or "tasks")
  const [activeSection, setActiveSection] = useState<"dashboard" | "tasks">("dashboard");

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const [statusCount, setStatusCount] = useState<any>({});
  const [priorityCount, setPriorityCount] = useState<any>({});
  const [overdueCount, setOverdueCount] = useState(0);

  // =========================
  // LOGOUT HANDLER WITH REDIRECT
  // =========================
  const handleLogout = () => {
    logout();
    navigate("/", { replace: true }); // Redirects user back to Login route
  };

  // =========================
  // FETCH DATA
  // =========================
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const taskRes = await API.get("/tasks");
      const projectRes = await API.get("/projects");

      const taskData = taskRes.data.data || [];
      const projectData = projectRes.data.data || [];

      setTasks(taskData);
      setProjects(projectData);

      calculateStats(taskData);
    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // CALCULATIONS
  // =========================
  const calculateStats = (tasks: Task[]) => {
    const status: any = {};
    const priority: any = {};
    let overdue = 0;

    const today = new Date();

    tasks.forEach((t) => {
      status[t.status] = (status[t.status] || 0) + 1;
      priority[t.priority] = (priority[t.priority] || 0) + 1;

      if (new Date(t.dueDate) < today && t.status !== "DONE") {
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

  // =========================
  // ADMIN DASHBOARD
  // =========================
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

  // =========================
  // PM DASHBOARD
  // =========================
  const PMView = () => {
    const upcomingTasks = tasks.filter((t) => {
      const due = new Date(t.dueDate);
      const now = new Date();
      const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 7;
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
              {upcomingTasks.map((t) => (
                <li key={t.id} className="upcoming-item">
                  <span className="task-title">{t.title}</span>
                  <time className="task-date">
                    📅 {new Date(t.dueDate).toDateString()}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    );
  };

  // =========================
  // DEV DASHBOARD
  // =========================
  const DevView = () => {
    const sortedTasks = [...tasks].sort((a, b) => {
      const priorityOrder = {
        CRITICAL: 4,
        HIGH: 3,
        MEDIUM: 2,
        LOW: 1,
      };

      const pDiff =
        priorityOrder[b.priority as keyof typeof priorityOrder] -
        priorityOrder[a.priority as keyof typeof priorityOrder];

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
                      Due: {new Date(t.dueDate).toLocaleDateString()}
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

  // =========================
  // RENDER BASED ON ROLE
  // =========================
  if (!user) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

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
          <span className="user-role-badge">{user.role}</span>
          {/* Attached updated logout handler */}
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