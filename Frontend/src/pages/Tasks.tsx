import { useEffect, useState } from "react";
import { API } from "../api/client";
import { useAuth } from "../context/AuthContext";
import "../css/Task.css"

type Task = {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate: string;
};

export default function Tasks() {
  const { user } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  // 🆕 form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const [assignedToId, setAssignedToId] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [dueDate, setDueDate] = useState("");

  // =========================
  // FETCH TASKS
  // =========================
  useEffect(() => {
    fetchTasks();
  }, [statusFilter, priorityFilter]);

  const fetchTasks = async () => {
    try {
      const res = await API.get("/tasks", {
        params: {
          status: statusFilter,
          priority: priorityFilter,
        },
      });

      setTasks(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // CREATE TASK (ADMIN / PM)
  // =========================
  const createTask = async () => {
    try {
      await API.post("/tasks", {
        title,
        description,
        projectId: Number(projectId),
        assignedToId: Number(assignedToId),
        priority,
        dueDate,
      });

      alert("Task created ✅");

      // reset
      setTitle("");
      setDescription("");
      setProjectId("");
      setAssignedToId("");
      setDueDate("");

      fetchTasks();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Error creating task");
    }
  };

  // =========================
  // UPDATE STATUS
  // =========================
  const updateStatus = async (taskId: number, newStatus: string) => {
    try {
      await API.put(`/tasks/${taskId}/status`, {
        status: newStatus,
      });

      fetchTasks();
    } catch (err) {
      console.error(err);
      alert("Not allowed");
    }
  };

  // Dynamic helper for badges
  const getBadgeClass = (value: string) => {
    const val = value ? value.toUpperCase() : "";
    if (val === "CRITICAL" || val === "HIGH") return "badge badge-danger";
    if (val === "MEDIUM" || val === "IN_PROGRESS" || val === "IN_REVIEW")
      return "badge badge-warning";
    if (val === "DONE" || val === "LOW") return "badge badge-success";
    return "badge badge-default";
  };

  return (
    <div className="tasks-container">
      {/* HEADER */}
      <header className="tasks-header">
        <h2>Task Management</h2>
        <p className="tasks-subtitle">
          Manage tasks, assign team members, and update workflow statuses.
        </p>
      </header>

      {/* 🆕 CREATE TASK FORM (SHOW ONLY FOR ADMIN + PM) */}
      {(user?.role === "ADMIN" || user?.role === "PM") && (
        <section className="create-task-card">
          <div className="card-header">
            <h3>➕ Create New Task</h3>
            <p className="card-subtitle">
              Fill in the details below to assign a task to a project member.
            </p>
          </div>

          <div className="form-grid">
            <div className="form-group full-width">
              <label>Task Title</label>
              <input
                className="form-input"
                placeholder="e.g. Implement Auth Middleware"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-group full-width">
              <label>Description</label>
              <input
                className="form-input"
                placeholder="Brief summary of requirements..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Project ID</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 12"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Assign To (User ID)</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 5"
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Priority</label>
              <select
                className="form-select"
                onChange={(e) => setPriority(e.target.value)}
                value={priority}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>

            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                className="form-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-actions">
            <button className="primary-btn" onClick={createTask}>
              Create Task
            </button>
          </div>
        </section>
      )}

      {/* FILTERS TOOLBAR */}
      <section className="filter-bar">
        <div className="filter-group">
          <label>Status Filter</label>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="TODO">TODO</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="IN_REVIEW">IN_REVIEW</option>
            <option value="DONE">DONE</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Priority Filter</label>
          <select
            className="filter-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All Priority</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
        </div>
      </section>

      {/* TASK LIST */}
      <main className="tasks-list-section">
        {tasks.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📋</span>
            <p>No tasks found matching your filters.</p>
          </div>
        ) : (
          <div className="tasks-grid">
            {tasks.map((task) => (
              <article key={task.id} className="task-card">
                <div className="task-card-header">
                  <h4 className="task-card-title">{task.title}</h4>
                  <span className={getBadgeClass(task.priority)}>
                    {task.priority}
                  </span>
                </div>

                {task.description && (
                  <p className="task-card-description">{task.description}</p>
                )}

                <div className="task-card-meta">
                  <div className="meta-item">
                    <span className="meta-label">Current Status:</span>
                    <span className={getBadgeClass(task.status)}>
                      {task.status}
                    </span>
                  </div>

                  {task.dueDate && (
                    <div className="meta-item">
                      <span className="meta-label">Due Date:</span>
                      <time className="meta-date">
                        📅 {new Date(task.dueDate).toDateString()}
                      </time>
                    </div>
                  )}
                </div>

                <div className="task-card-actions">
                  <label>Change Status</label>
                  <select
                    className="status-action-select"
                    value={task.status}
                    onChange={(e) => updateStatus(task.id, e.target.value)}
                  >
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="IN_REVIEW">IN_REVIEW</option>
                    <option value="DONE">DONE</option>
                  </select>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}