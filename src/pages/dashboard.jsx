import React from 'react'
import { useLocation } from 'react-router-dom'
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import AppSidebar from "@/components/sidebar"

function Dashboard() {
  const location = useLocation();

  if (location.state?.UserID) {
    console.log("User ID from location state:", location.state.UserID);
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 p-6 bg-slate-50 dark:bg-zinc-900">
          <header className="flex items-center gap-4 mb-6">
            {/* <SidebarTrigger />  */}
            
          </header>
          <div className="mb-6">
            <p className="text-muted-foreground">
              Welcome to the Task Management Dashboard! Here you can manage your tasks, view progress, and stay organized.
            </p>
          </div>
          <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
            Dashboard Content Goes Here
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

export default Dashboard