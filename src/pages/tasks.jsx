import React, { useState, useEffect } from 'react';
import AppSidebar from "@/components/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Search } from 'lucide-react';
import { Input } from "../components/ui/input.jsx";
import { gettasks, statusupdate } from "@/services/taskservices";
import '../css/tasks.css';

function Tasks() {
  const [tasks, setTasks] = useState([]);

  const currentUserId = sessionStorage.getItem("currentUserId");

  const fetchUserTasks = async () => {
    if (currentUserId) {
      try {
        const data = await gettasks(currentUserId);
        setTasks(data || []);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    }
  };

  const handlestatus = async (taskId) => {
    try {
      setTasks(prevTasks =>
        prevTasks.map(task =>
          (task.id === taskId || task._id === taskId) ? { ...task, status: "Completed" } : task
        )
      );
      await statusupdate(taskId);
      await fetchUserTasks();
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  };

  useEffect(() => {
    fetchUserTasks();
  }, [currentUserId]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full relative">
        <AppSidebar className=" m-5 p-5" />

        {/* main container handles the background layout safely */}
        <main className="flex-1 bg-slate-50 dark:bg-zinc-900 relative">
          
          {/* Unified Fixed Header matching the CSS wrapper */}
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

          {/* Page contents starting nicely below the fixed header bounds */}
          <div className="tasks-container">
            <div className="tasks-header">
              <div>
                <h2 className="tasks-title">My Tasks</h2>
                <p className="tasks-subtitle">Manage and track your assigned work items</p>
              </div>
            </div>

            {tasks.length === 0 ? (
              <div className="empty-tasks-state">
                <p className="empty-tasks-message">No tasks assigned to you yet.</p>
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
                        <h3 className="task-card-title">
                          {task.title}
                        </h3>
                        
                        {isCompleted ? (
                          <span className="task-status-badge badge-completed">
                            Completed
                          </span>
                        ) : (
                          <button 
                            onClick={() => handlestatus(taskId)}
                            className="status-toggle-btn"
                          >
                            Mark Complete
                          </button>
                        )}
                      </div>

                      <p className="task-card-description">
                        {task.description || "No description provided."}
                      </p>

                      <div className="task-card-footer">
                        <div className="task-dates">
                          <span className="date-issued">Issued: {task.issuedate}</span>
                          <span className="date-due">Due: {task.finaldate}</span>
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