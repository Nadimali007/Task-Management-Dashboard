import { Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import Profile from './pages/profile';
import Tasks from "./pages/tasks";

function App() {
  return (
    
<Routes>
 

  <Route path="/" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/tasks" element={<Tasks />}/>
  <Route path="/profile" element={<Profile />}/>
</Routes>

  );
}

export default App;