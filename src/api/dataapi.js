import axios from "axios";

export const userApi = axios.create({
  baseURL: "https://6a44ba99aab3faec3f68c708.mockapi.io/api/v1",
});

export const profileApi = axios.create({
  baseURL: "https://6a58a48968601fc330e90991.mockapi.io/api/v1",
});

export const projectTeamApi = axios.create({
  baseURL: "https://6a61ced3da10c59c1809dc52.mockapi.io/api/v1",
});

export const teamMemberApi = axios.create({
  baseURL: "https://6a61d68dda10c59c1809e453.mockapi.io/api/v1",
});

export default userApi;