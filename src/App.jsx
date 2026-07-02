import { Routes, Route } from "react-router-dom";
import Login from "./authentications/login";
import Register from "./authentications/register";
import "./App.css";

function App() {
  return (
    <div className="body">
      <div className="left">
        <Routes>
          
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>

      <div className="right">
        <div className="mainImage"></div>
      </div>
    </div>
  );
}

export default App;