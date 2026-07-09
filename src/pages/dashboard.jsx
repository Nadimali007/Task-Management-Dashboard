import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/sidebar";
import { Input } from "@/components/ui/input";
import { Search, Plus, FolderArchive, CheckCircle, Hourglass, AlertCircle, Eye } from "lucide-react";
import { addtasks, gettasks, statusupdate } from "@/services/taskservices";
import Performancechart from "@/components/performancechart";
import '../css/dashboard.css';
import { useDispatch, useSelector } from "react-redux";
import { addActivity } from "@/redux/activitySlice";

function Dashboard() {
  const [openTaskEntry, setOpenTaskEntry] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [finalDate, setFinalDate] = useState("");
  const [tasks, setTasks] = useState([]);
  const [viewtask, setviewtask] = useState(false);

  const dispatch = useDispatch();
  const recentactivities = useSelector((state) => state.activity.logs);

  const location = useLocation();
  const currentUserId = location.state?.UserID || location.state?.userId || sessionStorage.getItem("currentUserId");

  if ((location.state?.UserID || location.state?.userId) && !sessionStorage.getItem("currentUserId")) {
    sessionStorage.setItem("currentUserId", location.state?.UserID || location.state?.userId);
  }

  const fetchTasks = async () => {
    if (currentUserId) {
      try {
        console.log("Fetching tasks for User ID:", currentUserId);
        const data = await gettasks(currentUserId);
        console.log("Data received from API:", data);
        setTasks(data || []);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [currentUserId]);

  const totalTasksCount = tasks.length;
  const completeTaskCounts = tasks.filter(task => task.status === "Completed").length;
  const pendingTasksCount = tasks.filter(task => task.status === "Incomplete" || task.status === "Pending").length;
  const todayStr = new Date().toISOString().split('T')[0];
  const overdueTasksCount = tasks.filter(task => {
    return (task.status === "Incomplete" || task.status === "Pending") && task.finaldate < todayStr;
  }).length;

  const name = location.state?.name;

  const handleTaskCreation = () => {
    setOpenTaskEntry(true);
  };

  const handleviewtask = () => {
    setviewtask(!viewtask);
    if (!viewtask) {
      fetchTasks();
    }
  };

  const handlestatus = async (taskId) => {
    try {
      const targetTask = tasks.find(t => (t.id === taskId || t._id === taskId));

      setTasks(prevTasks =>
        prevTasks.map(task =>
          (task.id === taskId || task._id === taskId) ? { ...task, status: "Completed" } : task
        )
      );

      await statusupdate(taskId);

      dispatch(addActivity(" Task Completed "));

      await fetchTasks();
    } catch (error) {
      console.error("Failed to update task status on the server:", error);
    }
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
      userId: currentUserId || null,
    };

    try {
      await addtasks(newTask);
      await fetchTasks();

      dispatch(addActivity("Task Created"));

      setTaskName("");
      setTaskDescription("");
      setIssueDate("");
      setFinalDate("");
      setOpenTaskEntry(false);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  console.log("Recent activity from Redux: ", recentactivities);

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
              <button className="createtask" onClick={handleviewtask}>
                <Eye /> {viewtask ? "Hide Tasks" : "View Task"}
              </button>
            </div>
          </div>

          <div className="tasksdiv">
            <div className="totaltasks"><div className="upersubdiv"><div className="image"><FolderArchive /></div> <span>12%</span></div>
              <p >TOTAL TASKS</p><div className="count">{totalTasksCount}</div></div>
            <div className="completetasks"><div className="upersubdiv"><div className="image"><CheckCircle /> </div><span>{completeTaskCounts}/{totalTasksCount}</span></div>
              <p>COMPLETED</p><div className="count">{completeTaskCounts}</div></div>
            <div className="pendingtasks"><div className="upersubdiv"><div className="image"><Hourglass /> </div><span>{pendingTasksCount} Left</span></div>
              <p>PENDING</p><div className="count">{pendingTasksCount}</div></div>
            <div className="overduetasks"><div className="upersubdiv"><div className="image"><AlertCircle /> </div><span>critical</span></div>
              <p>OVERDUE</p><div className="count">{overdueTasksCount}</div></div>
          </div>

          <div className="lowerdata">
            <Performancechart className=" mychart" tasks={tasks} />
            <div className="recentactvities">
              <h3>Recent Activities</h3>
              {recentactivities.length === 0 ? (
                <div className="activity" style={{ opacity: 0.5 }}>No recent activities</div>
              ) : (
                recentactivities.map((activity, index) => (
                  <div key={index} className="activity">{activity}</div>
                ))
              )}
            </div>
          </div>

        </main>

        {viewtask && (
          <div className="taskformdiv">
            <div className="task-view-modal">
              <div className="modal-header">
                <h3>My Tasks</h3>
                <button className="close-modal-btn" onClick={() => setviewtask(false)}>
                  ✕
                </button>
              </div>

              {tasks.length === 0 ? (
                <p className="no-tasks-message">No tasks assigned to you yet.</p>
              ) : (
                <div className="modal-tasks-list">
                  {tasks.map((task) => {
                    const taskId = task.id || task._id;
                    return (
                      <div key={taskId} className="modal-task-item">
                        {task.status !== "Completed" && (
                          <button
                            onClick={() => handlestatus(taskId)}
                            className="createtask"
                            style={{ margin: "0 12px 0 0", padding: "6px 12px", fontSize: "13px" }}
                          >
                            Complete
                          </button>
                        )}

                        <div className="task-info">
                          <h4 style={{ textDecoration: task.status === "Completed" ? "line-through" : "none", opacity: task.status === "Completed" ? 0.6 : 1 }}>
                            {task.title}
                          </h4>
                          <p>{task.description}</p>
                          <span className="task-date">Due: {task.finaldate}</span>
                          <span className="status-badge">
                            {task.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

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
                    className='inputfield'
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