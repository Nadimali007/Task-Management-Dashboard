import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/sidebar";
import { Input } from "@/components/ui/input";
import { Search, Plus, FolderArchive, CheckCircle, Hourglass, AlertCircle, Check, ListFilter } from "lucide-react";
import { addtasks, gettasks, recentactitivity, logActivity } from "@/services/taskservices";
import Performancechart from "@/components/performancechart";
import '../css/dashboard.css';

function Dashboard() {
  const [openTaskEntry, setOpenTaskEntry] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [finalDate, setFinalDate] = useState("");
  const [priority, setpriority] = useState("");
  const [tasks, setTasks] = useState([]);
  const [recentactivities, setRecentactivities] = useState([]);
  const [filterPriority, setFilterPriority] = useState("All");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const location = useLocation();
  const currentUserId = (() => {
    if (location.state?.UserID) return location.state.UserID;
    if (location.state?.userId) return location.state.userId;

    const sessionUser = JSON.parse(sessionStorage.getItem("user"));
    if (sessionUser?.id) return sessionUser.id;

    const localUser = JSON.parse(localStorage.getItem("user"));
    if (localUser?.id) return localUser.id;

    return null;
  })();

  const name = (() => {
    if (location.state?.name) return location.state.name;
    if (location.state?.name) return location.state.name;

    const sessionUser = JSON.parse(sessionStorage.getItem("user"));
    if (sessionUser?.name) return sessionUser.name;

    const localUser = JSON.parse(localStorage.getItem("user"));
    if (localUser?.name) return localUser.name;

    return null;
  })();

  const fetchTasks = async () => {
    if (currentUserId) {
      try {
        const data = await gettasks(currentUserId);
        console.log("userlogin id for api call", currentUserId)
        console.log("Name: ", name);
        setTasks(data || []);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    }
  };

  const fetchActivities = async () => {
    if (currentUserId) {
      try {
        const data = await recentactitivity(currentUserId);

        const daysLimit = 3;
        const cutoffTime = Date.now() - (daysLimit * 24 * 60 * 60 * 1000);

        const userlogs = data
          .filter(log => String(log.userId) === String(currentUserId))
          .filter(log => {
            const activitycreationDate = log.createDate || log.createdAt;
            if (!activitycreationDate) return false;

            const logTime = typeof activitycreationDate === 'number' && activitycreationDate < 10000000000
              ? new Date(activitycreationDate * 1000).getTime()
              : new Date(activitycreationDate).getTime();

            return logTime >= cutoffTime;
          })
          .reverse();

        setRecentactivities(userlogs);
      } catch (error) {
        console.error("Error fetching activities:", error);
      }
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchActivities();
    if (currentUserId) {
      sessionStorage.setItem("currentUserId", currentUserId);
    }
  }, [currentUserId]);

  const totalTasksCount = tasks.length;
  const completeTaskCounts = tasks.filter(task => task.status === "Completed").length;
  const pendingTasksCount = tasks.filter(task => task.status === "Incomplete" || task.status === "Pending" || task.status === "Todo" || task.status === "In Progress").length;

  const formatTaskDateString = (dateVal) => {
    if (typeof dateVal === 'number') {
      return new Date(dateVal * 1000).toISOString().split('T')[0];
    }
    return dateVal;
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const overdueTasksCount = tasks.filter(task => {
    const isUnfinished = task.status === "Incomplete" || task.status === "Pending" || task.status === "Todo" || task.status === "In Progress";
    const taskFinalDateStr = formatTaskDateString(task.finaldate);
    return isUnfinished && taskFinalDateStr < todayStr;
  }).length;

  const handleTaskCreation = () => {
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
      userId: currentUserId || null,
    };

    try {
      await addtasks(newTask);
      await logActivity(currentUserId, "Task Created", taskName);

      await fetchTasks();
      await fetchActivities();

      setTaskName("");
      setTaskDescription("");
      setIssueDate("");
      setFinalDate("");
      setpriority("");
      setOpenTaskEntry(false);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const formattedTasksForChart = tasks.map(task => ({
    ...task,
    issuedate: formatTaskDateString(task.issuedate),
    finaldate: formatTaskDateString(task.finaldate)
  }));

  const getFilteredTasks = () => {
    if (filterPriority === "All") return tasks;
    return tasks.filter(task => task.priority?.toLowerCase() === filterPriority.toLowerCase());
  };

  const filteredTasks = getFilteredTasks();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full relative">
        <AppSidebar className=" m-5 p-5" />

        <main className="flex-1 bg-slate-50 dark:bg-zinc-900 pt-[60px]">
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

          <div className="welcomdiv">
            <h2>Good Morning {name} </h2>
            <p>You have {pendingTasksCount} pending and an upcoming meeting in 30 minutes. Let's make this day productive.</p>
            <div className="taskbuttons">
              <button className="createtask" onClick={handleTaskCreation}>
                <Plus /> Create Task
              </button>
              <button className="viewschedule">View Schedule</button>
            </div>
          </div>

          <div className="tasksdiv">
            <div className="totaltasks">
              <div className="upersubdiv">
                <div className="image"><FolderArchive /></div>
                <span>12%</span>
              </div>
              <p>TOTAL TASKS</p>
              <div className="count">{totalTasksCount}</div>
            </div>
            <div className="completetasks">
              <div className="upersubdiv">
                <div className="image"><CheckCircle /></div>
                <span>{completeTaskCounts}/{totalTasksCount}</span>
              </div>
              <p>COMPLETED</p>
              <div className="count">{completeTaskCounts}</div>
            </div>
            <div className="pendingtasks">
              <div className="upersubdiv">
                <div className="image"><Hourglass /></div>
                <span>{pendingTasksCount} Left</span>
              </div>
              <p>PENDING</p>
              <div className="count">{pendingTasksCount}</div>
            </div>
            <div className="overduetasks">
              <div className="upersubdiv">
                <div className="image"><AlertCircle /></div>
                <span>critical</span>
              </div>
              <p>OVERDUE</p>
              <div className="count">{overdueTasksCount}</div>
            </div>
          </div>

          <div className="lowerdata">
            <Performancechart className=" mychart" tasks={formattedTasksForChart} />
            <div className="recentactvities">
              <h2>Recent Activity</h2>
              <div className="activities-list">
                {recentactivities.length > 0 ? (
                  recentactivities.map((activity) => {
                    const isCompleted = activity.type === "task_completed" || activity.title?.toLowerCase().includes("complete");
                    const iconClass = isCompleted ? "icon-completed" : "icon-created";
                    const dateValue = activity.createDate || activity.createdAt;

                    return (
                      <div key={activity.id} className="activity-item">
                        <div className={`activity-icon-wrapper ${iconClass}`}>
                          {isCompleted ? (
                            <Check size={16} strokeWidth={3} />
                          ) : (
                            <Plus size={16} strokeWidth={3} />
                          )}
                        </div>
                        <div className="activity-content">
                          <span className="activity-title">{activity.title}</span>
                          <span className="activity-description">{activity.description}</span>
                          {dateValue && (
                            <span className="activity-time">
                              {new Date(dateValue).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(dateValue).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="no-activity-placeholder">No recent activity</div>
                )}
              </div>
            </div>
          </div>

          <div className="focustasks">
            <div className="headerrow">
              <h3>Focus Tasks</h3>
              <div className="filter-container">
                <div className="filter" onClick={() => setShowFilterDropdown(!showFilterDropdown)}>
                  <ListFilter size={18} />
                  <p>Filter</p>
                </div>
                {showFilterDropdown && (
                  <div className="filter-dropdown" style={{ cursor: "pointer" }}>
                    <div
                      className={`filter-item ${filterPriority === "All" ? "active" : ""}`}
                      onClick={() => { setFilterPriority("All"); setShowFilterDropdown(false); }}
                    >
                      All Tasks
                    </div>
                    <div
                      className={`filter-item ${filterPriority === "Low" ? "active" : ""}`}
                      onClick={() => { setFilterPriority("Low"); setShowFilterDropdown(false); }}
                    >
                      Low Priority
                    </div>
                    <div
                      className={`filter-item ${filterPriority === "High" ? "active" : ""}`}
                      onClick={() => { setFilterPriority("High"); setShowFilterDropdown(false); }}
                    >
                      High Priority
                    </div>
                    <div
                      className={`filter-item ${filterPriority === "Critical" ? "active" : ""}`}
                      onClick={() => { setFilterPriority("Critical"); setShowFilterDropdown(false); }}
                    >
                      Critical Priority
                    </div>
                  </div>
                )}
              </div>
            </div>
            <hr style={{ marginTop: "10px", borderColor: "rgb(48, 48, 48)" }} />
            <div className="table-responsive">
              <table className="task-table">
                <thead>
                  <tr>
                    <th>Task Name</th>
                    <th>Priority</th>
                    <th>Due Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                      <tr key={task.id}>
                        <td>{task.title}</td>
                        <td>
                          <span className={`priority-${task.priority?.toLowerCase()}`}>
                            {task.priority}
                          </span>
                        </td>
                        <td>{formatTaskDateString(task.finaldate)}</td>
                        <td>
                          <span className={`status-${task.status?.toLowerCase().replace(/\s+/g, '')}`}>
                            {task.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="no-tasks">
                        {filterPriority !== "All" ? `No ${filterPriority} tasks available` : "No tasks available"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

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
                  <label>Issue Date</label>
                  <Input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="inputfield"
                    required
                  />
                </div>

                <div>
                  <label>End Date</label>
                  <Input
                    type="date"
                    value={finalDate}
                    onChange={(e) => setFinalDate(e.target.value)}
                    className="inputfield"
                    required
                  />
                </div>

                <div>
                  <label>Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setpriority(e.target.value)}
                    className="inputfield cursor-pointer"
                    required
                  >
                    <option value="" disabled>Select Priority...</option>
                    <option value="Low">Low</option>
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

export default Dashboard;