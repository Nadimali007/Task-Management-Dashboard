import { userApi, profileApi } from "../api/dataapi";

export const getUsers = async () => {
  const res = await userApi.get("/users");
  return res.data;
};

export const registerUser = async (userData) => {
  const res = await userApi.post("/users", userData);
  return res.data;
};

export const updateUser = async (userId, updatedFields) => {
  const res = await userApi.get(`/users/${userId}`);
  const existingUser = res.data;

  const updatedUser = {
    ...existingUser,
    ...updatedFields,
  };

  const response = await userApi.put(`/users/${userId}`, updatedUser);
  return response.data;
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

export const updateProfile = async (profileIdOrUserId, updatedFields) => {
  let profile = null;
  try {
    const res = await profileApi.get(`/user_profiles/${profileIdOrUserId}`);
    profile = res.data;
  } catch (e) {
    profile = await getProfileByUserId(profileIdOrUserId);
  }

  if (profile) {
    const updatedProfile = {
      ...profile,
      ...updatedFields,
    };
    const response = await profileApi.put(`/user_profiles/${profile.id}`, updatedProfile);
    return response.data;
  }

  return null;
};

export const deleteProfile = async (profileId) => {
  const res = await profileApi.delete(`/user_profiles/${profileId}`);
  return res.data;
};