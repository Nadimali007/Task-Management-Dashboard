import api from "../api/dataapi";

export const getUsers = async () => {
  const res = await api.get("/users");
  return res.data;
};

export const registerUser = async (userData) => {
  const res = await api.post("/users", userData);
  return res.data;
};

export const resetPassword = async (email, newPassword) => {
  const res = await api.get("/users");

  const user = res.data.find(
    (u) =>
      u.email.trim().toLowerCase() ===
      email.trim().toLowerCase()
  );

  if (!user) {
    throw new Error("Email not found");
  }

  const updatedUser = {
    ...user,
    password: newPassword,
  };

  const response = await api.put(
    `/users/${user.id}`,
    updatedUser
  );

  return response.data;
};