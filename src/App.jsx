import { Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/Dashboard";
import AuthLayout from "./layouts/authlayout";
import "./App.css";

function App() {
  return (
    
<Routes>
  <Route
    path="/"
    element={
      <AuthLayout>
        <Login />
      </AuthLayout>
    }
  />

  <Route
    path="/register"
    element={
      <AuthLayout>
        <Register />
      </AuthLayout>
    }
  />

  <Route path="/dashboard" element={<Dashboard />} />
</Routes>

  );
}

export default App;