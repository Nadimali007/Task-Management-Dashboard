import api from "../api/dataapi";
import Activityapi from "../api/recentactivitiesapi";
import { projectTeamApi, teamMemberApi } from "../api/dataapi";

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
  return res.data.filter(task => String(task.userId) === String(userId));
};

export const getAllTasks = async () => {
  const res = await api.get("/Tasks");
  return res.data;
};

export const statusupdate = async (taskId, status) => {
  const res = await api.put(`/Tasks/${taskId}`, { status: status });
  return res.data; 
};

export const getProjects = async () => {
  const res = await projectTeamApi.get("/projects");
  return res.data;
};

export const addProject = async (newProject) => {
  const res = await projectTeamApi.post("/projects", newProject);
  return res.data;
};

export const getProjectsByTeam = async (teamId) => {
  const res = await projectTeamApi.get("/projects");
  return res.data.filter((project) => String(project.teamId) === String(teamId));
};

export const getTeams = async () => {
  const res = await projectTeamApi.get("/teams");
  return res.data;
};

export const addTeam = async (newTeam) => {
  const res = await projectTeamApi.post("/teams", newTeam);
  return res.data;
};

export const getTeamMembers = async () => {
  const res = await teamMemberApi.get("/teammembers");
  return res.data;
};

export const addTeamMember = async (memberData) => {
  const res = await teamMemberApi.post("/teammembers", memberData);
  return res.data;
};

export const getUserTeams = async (userId) => {
  const res = await teamMemberApi.get("/teammembers");
  return res.data.filter((member) => String(member.userId) === String(userId));
};

export const updateProject = async (projectId, updates) => {
  const res = await projectTeamApi.patch(`/projects/${projectId}`, updates);
  return res.data;
};