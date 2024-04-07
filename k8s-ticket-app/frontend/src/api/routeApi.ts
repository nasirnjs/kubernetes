import { AxiosResponse } from "axios";
import { axiosInstance } from "./baseApi";

export function getRouteListApi() {
  return new Promise<AxiosResponse<any>>((resolve, reject) => {
    axiosInstance
      .get(`route/all-routes`)
      .then((resp) => {
        resolve(resp);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function createRouteApi(name: string) {
  return new Promise<AxiosResponse<any>>((resolve, reject) => {
    axiosInstance
      .post(`route/create`, {
        name,
      })
      .then((resp) => {
        resolve(resp);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function updateRouteApi(routeId: string, updatedName: string) {
  return new Promise<AxiosResponse<any>>((resolve, reject) => {
    axiosInstance
      .put(`route/update`, {
        routeId,
        updatedName,
      })
      .then((resp) => {
        resolve(resp);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function deleteRouteApi(routeId: string) {
  return new Promise<AxiosResponse<any>>((resolve, reject) => {
    axiosInstance
      .delete(`route/delete/${routeId}`)
      .then((resp) => {
        resolve(resp);
      })
      .catch((err) => {
        reject(err);
      });
  });
}
