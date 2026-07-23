import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import AppSidebar from "@/components/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Search, X, Plus } from 'lucide-react';
import { Input } from "../components/ui/input.jsx";
import { 
  getAllTasks, 
  statusupdate, 
  logActivity, 
  addtasks, 
  getProjects, 
  getUserTeams 
} from "@/services/taskservices";
import { getUsers } from "../services/authservices";
import '../css/tasks.css';

function TaskCard({ task, userId, usersMap, onClick, formatDate }) {
  const isCompleted = task.status?.toLowerCase() === "completed";
  const isInProgress = task.status?.toLowerCase() === "in progress" || task.status?.toLowerCase() === "inprogress";
  
  const assignedUserName = usersMap[String(task.userId)] || `User ${task.userId}`;
  const isAssignedToCurrentUser = String(task.userId) === String(userId);
  const priority = task.priority || "Medium";

  const getFooterStatusText = () => {
    if (isInProgress) return "In Progress";
    if (isCompleted) return "Completed";
    return `Due: ${formatDate(task.finaldate)}`;
  };

  return (
    <div
      onClick={() => onClick(task, isAssignedToCurrentUser)}
      className={`task-card border-l-4 ${isAssignedToCurrentUser
        ? "border-l-indigo-600 dark:border-l-indigo-500 task-card-interactive task-card-mine"
        : "border-l-transparent task-card-disabled"
        } ${isCompleted ? "task-card-completed" : ""}`}
    >
      <div className="task-card-header flex flex-col items-start gap-2">
        <div className="task-badges flex items-center justify-between w-full">
          <span className={`task-priority-badge priority-${priority.toLowerCase()}`}>
            {priority}
          </span>
        </div>
        <h3 className={`task-card-title ${isCompleted ? "title-completed" : ""}`} style={{ marginTop: "10px" }}>
          {task.title}
        </h3>
      </div>

      <p className="task-card-description">{task.description || "No description provided."}</p>

      <div className="task-card-footer">
        <div className="task-dates">
          <span className="date-due">
            {getFooterStatusText()}
          </span>
        </div>
        <div className="task-assignee flex items-center gap-1.5">
          {isAssignedToCurrentUser && (
            <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
          )}
          <span>{assignedUserName} {isAssignedToCurrentUser && "(You)"}</span>
        </div>
      </div>
    </div>
  );
}

function TaskModal({ selectedTask, selectedStatus, usersMap, onStatusChange, onClose, onSave, formatDate }) {
  if (!selectedTask) return null;

  const priority = selectedTask.priority || "Medium";
  const assignedName = usersMap[String(selectedTask.userId)] || `User ${selectedTask.userId}`;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <button onClick={onClose} className="modal-close-btn" aria-label="Close modal">
            <X />
          </button>
        </div>

        <div className="modal-info-card">
          <h3 className="modal-title">{selectedTask.title}</h3>
          <p className="modal-description">
            {selectedTask.description || "No description provided for this task."}
          </p>
        </div>

        <div className="modal-grid">
          <div className="modal-info-card">
            <span className="modal-info-label">Assigned To</span>
            <span className="modal-info-value">{assignedName}</span>
          </div>

          <div className="modal-info-card">
            <span className="modal-info-label">Issued Date</span>
            <span className="modal-info-value">{formatDate(selectedTask.issuedate)}</span>
          </div>

          <div className="modal-info-card">
            <span className="modal-info-label">Due Date</span>
            <span className="modal-info-value due-accent">{formatDate(selectedTask.finaldate)}</span>
          </div>

          <div className="modal-info-card">
            <span className="modal-info-label">Priority</span>
            <span className="modal-info-value due-accent">{priority}</span>
          </div>
        </div>

        <div className="modal-select-wrapper">
          <label className="modal-select-label">Update Task Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="modal-select"
          >
            <option value="Incomplete">Incomplete</option>
            <option value="In Progress">In Progress</option>
            <option value="Review">Review</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <div className="modal-footer">
          <button onClick={onSave} className="modal-btn">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("In Progress");
  const [activeStatusFilter, setActiveStatusFilter] = useState("ALL");

  const [openTaskEntry, setOpenTaskEntry] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [finalDate, setFinalDate] = useState("");
  const [priority, setPriority] = useState("");
  const [projectId, setProjectId] = useState("");
  const [projectsList, setProjectsList] = useState([]);

  const location = useLocation();

  const formatDateForInput = (dateVal) => {
    if (!dateVal) return "";
    
    if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
      return dateVal;
    }

    const dateObj = typeof dateVal === 'number' ? new Date(dateVal * 1000) : new Date(dateVal);
    if (isNaN(dateObj.getTime())) return "";

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (dateVal) => {
    if (!dateVal) return "N/A";
    
    let dateObj;
    if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
      const [year, month, day] = dateVal.split('-').map(Number);
      dateObj = new Date(year, month - 1, day);
    } else {
      dateObj = typeof dateVal === 'number' ? new Date(dateVal * 1000) : new Date(dateVal);
    }

    if (isNaN(dateObj.getTime())) return dateVal;

    return dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };

  const getUserData = () => {
    const sessionUser = JSON.parse(sessionStorage.getItem("user") || "{}");
    const localUser = JSON.parse(localStorage.getItem("user") || "{}");

    const userId = location.state?.UserID || location.state?.userId || sessionUser?.id || localUser?.id || sessionStorage.getItem("currentUserId") || localStorage.getItem("currentUserId") || null;

    return { userId: userId ? String(userId) : null };
  };

  const { userId } = getUserData();

  const fetchUsersDirectory = async () => {
    try {
      const allUsers = await getUsers() || [];
      const mapping = {};
      allUsers.forEach(user => {
        const id = user.id || user._id;
        if (id) {
          mapping[String(id)] = user.name;
        }
      });
      setUsersMap(mapping);
    } catch (error) {
      console.error("Error creating users dictionary:", error);
    }
  };

  const fetchProjects = async () => {
    try {
      const allProjects = (await getProjects()) || [];

      let userTeamIds = [];
      try {
        if (userId) {
          const userTeams = (await getUserTeams(userId)) || [];
          userTeamIds = userTeams.map((m) => String(m.teamId));
        }
      } catch (err) {
        console.error("Error fetching user teams:", err);
      }

      const userProjects = allProjects.filter((project) => {
        const isCreator = String(project.createdByUserId || project.userId) === String(userId);
        const isTeamMatch = userTeamIds.some((tId) => String(project.teamId) === String(tId));
        const isMember =
          Array.isArray(project.members) &&
          project.members.some((m) => String(m.id || m.userId || m) === String(userId));

        return isCreator || isTeamMatch || isMember;
      });

      setProjectsList(userProjects);
      return userProjects;
    } catch (error) {
      console.error("Error fetching user projects:", error);
      return [];
    }
  };

  const fetchUserTasks = async () => {
    if (!userId) return;

    try {
      await fetchUsersDirectory();
      const userProjects = await fetchProjects();
      const userProjectIds = userProjects.map((p) => String(p.id || p._id));

      const allDatabaseTasks = (await getAllTasks()) || [];

      const filteredTasks = allDatabaseTasks.filter((task) => {
        const isAssigned = String(task.userId) === String(userId);
        const belongsToUserProject = userProjectIds.includes(String(task.projectId));
        return isAssigned || belongsToUserProject;
      });

      const sortedTasks = [...filteredTasks].sort((a, b) => {
        const aIsMine = String(a.userId) === String(userId);
        const bIsMine = String(b.userId) === String(userId);
        if (aIsMine && !bIsMine) return -1;
        if (!aIsMine && bIsMine) return 1;
        return 0;
      });

      setTasks(sortedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserTasks();
    }
  }, [userId]);

  const handleTaskCardClick = (task, isAssignedToCurrentUser) => {
    if (isAssignedToCurrentUser) {
      setSelectedTask(task);
      setSelectedStatus(task.status || "In Progress");
    }
  };

  const handleSaveAndClose = async () => {
    if (!selectedTask) return;

    const targetId = String(selectedTask.id || selectedTask._id);
    const taskTitle = selectedTask.title || "Unknown Task";
    const updatedStatus = selectedStatus;

    setTasks(prevTasks =>
      prevTasks.map(task => {
        const currentTaskId = String(task.id || task._id);
        if (currentTaskId === targetId) {
          return { ...task, status: updatedStatus };
        }
        return task;
      })
    );

    setSelectedTask(null);

    try {
      await statusupdate(targetId, updatedStatus);
      await logActivity(userId, `Task Status: ${updatedStatus}`, taskTitle);
    } catch (error) {
      console.error("Failed to update task status:", error);
      await fetchUserTasks();
    }
  };

  const handleTaskCreation = () => {
    const today = formatDateForInput(new Date());
    setIssueDate(today);
    setFinalDate(today);
    setOpenTaskEntry(true);
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();

    if (new Date(finalDate) < new Date(issueDate)) {
      alert("End Date cannot be earlier than Issue Date.");
      return;
    }

    const newTask = {
      title: taskName,
      description: taskDescription,
      issuedate: issueDate,
      finaldate: finalDate,
      status: "Incomplete",
      priority: priority,
      projectId: projectId || null,
      userId: userId || null
    };

    try {
      const createdResponse = await addtasks(newTask);
      const createdTask = createdResponse?.data || createdResponse || newTask;

      setTasks(prevTasks => [createdTask, ...prevTasks]);

      await logActivity(userId, "Task Created", taskName);

      setTaskName("");
      setTaskDescription("");
      setIssueDate("");
      setFinalDate("");
      setPriority("");
      setProjectId("");
      setOpenTaskEntry(false);

      await fetchUserTasks();
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const statusCategories = [
    { key: "ALL", label: "ALL" },
    { key: "Incomplete", label: "INCOMPLETE" },
    { key: "In Progress", label: "IN PROGRESS" },
    { key: "Review", label: "REVIEW" },
    { key: "Completed", label: "COMPLETED" }
  ];

  const getStatusCount = (key) => {
    if (key === "ALL") return tasks.length;
    return tasks.filter(task => {
      const status = task.status ? task.status.toLowerCase() : "";
      if (key === "Completed") return status === "completed";
      if (key === "In Progress") return status === "in progress" || status === "inprogress";
      if (key === "Incomplete") return status === "incomplete" || status === "pending" || status === "todo";
      if (key === "Review") return status === "review";
      return false;
    }).length;
  };

  const filteredTasks = tasks.filter(task => {
    if (activeStatusFilter === "ALL") return true;
    const status = task.status ? task.status.toLowerCase() : "";
    if (activeStatusFilter === "Completed") return status === "completed";
    if (activeStatusFilter === "In Progress") return status === "in progress" || status === "inprogress";
    if (activeStatusFilter === "Incomplete") return status === "incomplete" || status === "pending" || status === "todo";
    if (activeStatusFilter === "Review") return status === "review";
    return true;
  });

  const renderTasksList = () => {
    if (filteredTasks.length === 0) {
      return (
        <div className="empty-tasks-state">
          <p className="empty-tasks-message">No tasks found for this status.</p>
        </div>
      );
    }

    return (
      <div className="tasks-grid">
        {filteredTasks.map(task => (
          <TaskCard
            key={task.id || task._id || Math.random()}
            task={task}
            userId={userId}
            usersMap={usersMap}
            onClick={handleTaskCardClick}
            formatDate={formatDisplayDate}
          />
        ))}
      </div>
    );
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full relative">
        <AppSidebar className="m-5 p-5" />

        <main className="flex-1 bg-slate-50 dark:bg-zinc-900 relative">
          <header className="dashboard-header">
            <SidebarTrigger className="md:hidden" />
            <div className="search-container-header">
              <Search className="search-icon" />
              <Input
                type="search"
                placeholder="Search Tasks, docs or people"
                className="search-input"
              />
            </div>
          </header>

          <div className="tasks-container">
            <div className="tasks-header">
              <div>
                <h2 className="tasks-title">
                  Kanban Board
                </h2>
                <p className="tasks-subtitle">
                  Manage and track work items assigned across your group
                </p>
              </div>
              <button className="createTaskBtn" onClick={handleTaskCreation}>
                <Plus /> Create Task
              </button>
            </div>

            <div className="status-filter-bar">
              {statusCategories.map(category => {
                const count = getStatusCount(category.key);
                const isActive = activeStatusFilter === category.key;
                return (
                  <button
                    key={category.key}
                    onClick={() => setActiveStatusFilter(category.key)}
                    className={`status-filter-tab ${isActive ? "active" : ""}`}
                  >
                    <span>{category.label}</span>
                    <span className="status-filter-count">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {renderTasksList()}
          </div>

          <TaskModal
            selectedTask={selectedTask}
            selectedStatus={selectedStatus}
            usersMap={usersMap}
            onStatusChange={setSelectedStatus}
            onClose={() => setSelectedTask(null)}
            onSave={handleSaveAndClose}
            formatDate={formatDisplayDate}
          />
        </main>

        {openTaskEntry && (
          <div className="taskformdiv">
            <div>
              <h3>Create New Task</h3>

              <form onSubmit={handleSubmitTask} className="taskform">
                <div>
                  <label>Task Title</label>
                  <Input
                    type="text"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    placeholder="Enter task name"
                    required
                    className="inputfield"
                  />
                </div>

                <div>
                  <label>Description</label>
                  <textarea
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    placeholder="Describe your task..."
                    className="textarea"
                  />
                </div>

                <div>
                  <label>Project</label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="inputfield cursor-pointer"
                    required
                  >
                    <option value="" disabled>Select Project...</option>
                    {projectsList.map((proj) => {
                      const pId = proj.id || proj._id;
                      return (
                        <option key={pId} value={pId}>
                          {proj.name || proj.title || `Project ${pId}`}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label>Issue Date</label>
                  <Input
                    type="date"
                    value={formatDateForInput(issueDate)}
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="inputfield cursor-pointer"
                    required
                  />
                </div>

                <div>
                  <label>End Date</label>
                  <Input
                    type="date"
                    value={formatDateForInput(finalDate)}
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                    onChange={(e) => setFinalDate(e.target.value)}
                    className="inputfield cursor-pointer"
                    required
                  />
                </div>

                <div>
                  <label>Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="inputfield cursor-pointer"
                    required
                  >
                    <option value="" disabled>Select Priority...</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div className="buttons">
                  <button
                    type="button"
                    onClick={() => setOpenTaskEntry(false)}
                    className="cancelButton"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="saveButton"
                  >
                    Save Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </SidebarProvider>
  );
}

export default Tasks;