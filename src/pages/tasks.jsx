import React from 'react'
import AppSidebar from "@/components/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Search } from 'lucide-react';
import {Input} from "../components/ui/input.jsx"
import '../css/tasks.css';

function Tasks() {
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

          <div>Welcom to tasks page</div>
        </main>

      </div>
    </SidebarProvider>
  );
}

export default Tasks
