import axios from "axios";

export const userApi = axios.create({
  baseURL: "https://6a44ba99aab3faec3f68c708.mockapi.io/api/v1",
});

export const profileApi = axios.create({
  baseURL: "https://6a58a48968601fc330e90991.mockapi.io/api/v1",
});

export default userApi;