import api from "../api/dataapi";
import Activityapi from "../api/recentactivitiesapi";

export const logActivity = async (userId, title, description) => {
  const newLogEntry = {
    userId: String(userId),
    title: title,
    description: description,
    activity: title, 
    createDate: new Date().toISOString() 
  };

  const res = await Activityapi.post("/Activities", newLogEntry);
  return res.data;
};

export const recentactitivity = async (userId) => {
  const res = await Activityapi.get("/Activities");
  return res.data.filter((log) => String(log.userId) === String(userId));
};

export const addtasks = async (newTask) => {
  const res = await api.post("/Tasks", newTask);
  return res.data;
};

export const gettasks = async (userId) => {
  const res = await api.get("/Tasks");
  return res.data.filter(task => task.userId === String(userId));
};

export const getAllTasks = async () => {
  const res = await api.get("/Tasks");
  return res.data;
};

export const statusupdate = async (taskId, status) => {
  const res = await api.put(`/Tasks/${taskId}`, { status: status });
  return res.data; 
};