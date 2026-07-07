import api from "../api/axios";

export const addtasks= async (newTask) =>
{
const res=await api.post("/Tasks",newTask)
return res.data;
}


export const gettasks = async (userId) => {
  const res = await api.get("/Tasks");

  return res.data.filter(task => task.userId === String(userId));
};