import React, { useState, useEffect } from 'react';
import AppSidebar from "@/components/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Search } from 'lucide-react';
import { Input } from "../components/ui/input.jsx";
import { gettasks, statusupdate, logActivity } from "@/services/taskservices";
import '../css/tasks.css';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [userId, setUserId] = useState(null);
  const [teamId, setTeamId] = useState(null);

  useEffect(() => {
    let storedId = sessionStorage.getItem("currentUserId") || localStorage.getItem("currentUserId");
                     
    if (!storedId) {
      storedId = sessionStorage.getItem("userId") || localStorage.getItem("userId");
    }

    if (!storedId) {
      const sessionUser = sessionStorage.getItem("user") || localStorage.getItem("user");
      if (sessionUser) {
        try {
          const parsed = JSON.parse(sessionUser);
          if (parsed.id || parsed._id) {
            storedId = parsed.id || parsed._id;
          }
          if (parsed.teamId) {
            setTeamId(String(parsed.teamId));
          }
        } catch (e) {
          console.error("Error parsing user object from storage", e);
        }
      }
    }

    if (storedId) {
      setUserId(String(storedId));
    }
  }, []);

  const fetchUserTasks = async () => {
    if (!userId) return;
    
    console.log("Logged in ID in TaskPage: ", userId);
    try {
      const data = await gettasks(userId) || [];
      
      let activeTeamId = teamId;

      if (!activeTeamId) {
        const currentUserTask = data.find(task => String(task.userId) === String(userId));
        if (currentUserTask?.teamId) {
          activeTeamId = String(currentUserTask.teamId);
          setTeamId(activeTeamId); 
        }
      }

      if (activeTeamId) {
        const teamTasks = data.filter(task => String(task.teamId) === String(activeTeamId));
        setTasks(teamTasks);
      } else {
        const individualTasks = data.filter(task => String(task.userId) === String(userId));
        setTasks(individualTasks);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserTasks();
    }
  }, [userId, teamId]); 

  const handlestatus = async (taskId) => {
    try {
      const targetTask = tasks.find(task => (task.id === taskId || task._id === taskId));
      const taskTitle = targetTask ? targetTask.title : "Unknown Task";

      setTasks(prevTasks =>
        prevTasks.map(task =>
          (task.id === taskId || task._id === taskId) ? { ...task, status: "Completed" } : task
        )
      );

      await logActivity(userId, "Task Completed", taskTitle);
      await statusupdate(taskId);
      await fetchUserTasks();
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  };

  const formatDisplayDate = (dateVal) => {
    if (typeof dateVal === 'number') {
      return new Date(dateVal * 1000).toLocaleDateString();
    }
    return dateVal;
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full relative">
        <AppSidebar className=" m-5 p-5" />
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
                <h2 className="tasks-title">Kanban Board</h2>
                <p className="tasks-subtitle">Manage and track work items assigned across your group</p>
              </div>
            </div>

            {tasks.length === 0 ? (
              <div className="empty-tasks-state">
                <p className="empty-tasks-message">No tasks assigned to your team yet.</p>
              </div>
            ) : (
              <div className="tasks-grid">
                {tasks.map((task) => {
                  const taskId = task.id || task._id;
                  const isCompleted = task.status === "Completed";

                  return (
                    <div
                      key={taskId}
                      className={`task-card ${isCompleted ? "task-completed" : ""}`}
                    >
                      <div className="task-card-header">
                        <h3 className="task-card-title">{task.title}</h3>
                        {isCompleted ? (
                          <span className="task-status-badge badge-completed">Completed</span>
                        ) : (
                          <button 
                            onClick={() => handlestatus(taskId)}
                            className="status-toggle-btn"
                          >
                            Mark Complete
                          </button>
                        )}
                      </div>
                      <p className="task-card-description">{task.description || "No description provided."}</p>
                      <div className="task-card-footer">
                        <div className="task-dates">
                          <span className="date-issued">Issued: {formatDisplayDate(task.issuedate)}</span>
                          <span className="date-due">Due: {formatDisplayDate(task.finaldate)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

export default Tasks;