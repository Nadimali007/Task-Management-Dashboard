import { userApi, profileApi } from "../api/dataapi";

export const getUsers = async () => {
  const res = await userApi.get("/users");
  return res.data;
};

export const registerUser = async (userData) => {
  const res = await userApi.post("/users", userData);
  return res.data;
};

export const resetPassword = async (email, newPassword) => {
  const res = await userApi.get("/users");

  const user = res.data.find(
    (u) => u.email.trim().toLowerCase() === email.trim().toLowerCase()
  );

  if (!user) {
    throw new Error("Email not found");
  }

  const updatedUser = {
    ...user,
    password: newPassword,
  };

  const response = await userApi.put(`/users/${user.id}`, updatedUser);
  return response.data;
};

export const getProfiles = async () => {
  const res = await profileApi.get("/user_profiles");
  return res.data;
};

export const getProfileById = async (profileId) => {
  const res = await profileApi.get(`/user_profiles/${profileId}`);
  return res.data;
};

export const getProfileByUserId = async (userId) => {
  const res = await profileApi.get("/user_profiles");
  const profile = res.data.find((p) => String(p.userId) === String(userId));
  return profile || null;
};

export const createProfile = async (profileData) => {
  const res = await profileApi.post("/user_profiles", profileData);
  return res.data;
};

export const updateProfile = async (profileId, updatedData) => {
  const res = await profileApi.put(`/user_profiles/${profileId}`, updatedData);
  return res.data;
};

export const deleteProfile = async (profileId) => {
  const res = await profileApi.delete(`/user_profiles/${profileId}`);
  return res.data;
};