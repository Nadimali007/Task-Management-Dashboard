import { Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import Profile from './pages/profile';
import Team from './pages/team';
import Tasks from "./pages/tasks";

function App() {
  return (
    
<Routes>
 

  <Route path="/" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/tasks" element={<Tasks />}/>
  <Route path="/profile" element={<Profile />}/>
  <Route path="/team" element={<Team />}/>
</Routes>

  );
}

export default App;