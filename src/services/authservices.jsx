import api from "../api/axios";

export const getUsers = async () => {
  const res = await api.get("/users");
  return res.data;
};

export const registerUser = async (userData) => {
  const res = await api.post("/users", userData);
  return res.data;
};