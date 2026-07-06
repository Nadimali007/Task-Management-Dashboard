import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/sidebar";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import '../css/dashboard.css';

function Dashboard() {
  const [openTaskEntry, setOpenTaskEntry] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");

  const location = useLocation();

  if (location.state?.UserID) {
    console.log("User ID from location state:", location.state.UserID);
  }

  const handleTaskCreation = () => {
    setOpenTaskEntry(true);
  };

  const handleSubmitTask = (e) => {
    e.preventDefault();
    
    const newTask = {
      title: taskName,
      description: taskDescription,
      userId: location.state?.UserID || null
    };

    console.log("Saving data:", newTask);

    setTaskName("");
    setTaskDescription("");
    setOpenTaskEntry(false);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full relative">
        <AppSidebar />

        <main className="flex-1 bg-slate-50 dark:bg-zinc-900">
          <header className="sticky top-0 z-50 flex items-center p-4">
            <SidebarTrigger className="md:hidden" />
          </header>

          <div className="search-container">
            <Search className="search-icon" />
            <Input
              type="search"
              placeholder="Search..."
              className="search-input"
            />
          </div>

          <div className="welcomdiv">
            <h2>Good Morning Awais</h2>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit...</p>
            <div className="taskbuttons">
              <button className="createtask" onClick={handleTaskCreation}>
                <Plus /> Create Task
              </button>
              <button className="viewschedule">View Schedule</button>
            </div>
          </div>
        </main>

        {openTaskEntry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div >
              <h3 >Create New Task</h3>
              
              <form onSubmit={handleSubmitTask} className="form">
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

                <div >
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