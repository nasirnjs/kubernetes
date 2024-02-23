import axios from "axios";

export const axiosInstance = axios.create({
//add Ingress Path
baseURL: "/be/api/v1",
  withCredentials: true,
});

// export const axiosInstance = axios.create({
//   baseURL: "http://192.168.0.106:7001/api/v1/",
// });
