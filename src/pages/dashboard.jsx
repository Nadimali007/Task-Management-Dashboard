import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/sidebar";
import { Input } from "@/components/ui/input";
import { Search, Plus, FolderArchive, CheckCircle, Hourglass, AlertCircle } from "lucide-react";
import { addtasks, gettasks } from "@/services/taskservices";
import '../css/dashboard.css';

function Dashboard() {
  const [openTaskEntry, setOpenTaskEntry] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [finalDate, setFinalDate] = useState("");
  const [tasks, setTasks] = useState([]);

  const location = useLocation();

  const fetchTasks = async () => {
    if (location.state?.UserID) {
      try {
        const data = await gettasks(location.state.UserID);
        setTasks(data || []);
        console.log(location.state.UserID);
      } catch (error) {
        console.error(error);
      }
    }
  };

  useEffect(() => {

    if (location.state?.UserID) {
      console.log("User ID from location state:", location.state.UserID);
    }


    fetchTasks();
  }, [location.state?.UserID]);

  const totalTasksCount = tasks.length;
  const completeTaskCounts = tasks.filter(task => task.status === "Completed").length;
  const pendingTasksCount = tasks.filter(task => task.status === "Incomplete").length;
  const todayStr = new Date().toISOString().split('T')[0];
  const overdueTasksCount = tasks.filter(task => {
    return task.status === "Incomplete" && task.finaldate < todayStr;
  }).length;

  const totaltasks = tasks.length;
  const completeTask = tasks.filter(task => task.status === "Completed").length;
  const pendingTasks = tasks.filter(task => task.status === "Incomplete").length;
  const todayString = new Date().toISOString().split('T')[0];
  const overdueTasks = tasks.filter(task => {
    return task.status === "Incomplete" && task.finaldate < todayStr;
  }).length;


  const name = location.state?.name;

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
    userId: location.state?.UserID || null,
  };

  try {
    await addtasks(newTask);
    await fetchTasks();

    setTaskName("");
    setTaskDescription("");
    setIssueDate("");
    setFinalDate("");
    setOpenTaskEntry(false);
  } catch (error) {
    console.error("Error creating task:", error);
  }
};

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full relative">
        <AppSidebar className=" m-5 p-5" />

        <main className="flex-1 bg-slate-50 dark:bg-zinc-900">
          <header className="sticky top-0 z-50 flex items-center p-4">
            <SidebarTrigger className="md:hidden" />
          </header>

          <div className="search-container">
            <Search className="search-icon" />
            <Input
              type="search"
              placeholder="Search Tasks, docs or people"
              className="search-input"
            />
          </div>

          <div className="welcomdiv">
            <h2>Good Morning {name} </h2>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit...</p>
            <div className="taskbuttons">
              <button className="createtask" onClick={handleTaskCreation}>
                <Plus /> Create Task
              </button>
              <button className="viewschedule">View Schedule</button>
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

        </main>

        {openTaskEntry && (
          <div className="taskformdiv">
            <div >
              <h3 >Create New Task</h3>

              <form onSubmit={handleSubmitTask} className="taskform">
                <div>
                  <label >Task Title</label>
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
                  <label >Description</label>
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