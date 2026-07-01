import axios from "axios";

const api = axios.create({
  baseURL: "https://6a44ba99aab3faec3f68c708.mockapi.io/api/v1",
});

export default api;