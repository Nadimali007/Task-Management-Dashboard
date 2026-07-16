import axios from "axios";

const Activityapi = axios.create({
  baseURL: "https://6a58a48968601fc330e90991.mockapi.io/api/v1",
});

export default Activityapi;