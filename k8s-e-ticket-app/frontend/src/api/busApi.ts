import { AxiosResponse } from "axios";
import { axiosInstance } from "./baseApi";

interface IBusCreate {
  busName: string;
  busType?: "ac" | "non_ac";
  numberOfSeat: string;
}
export function createBusApi(busData: IBusCreate) {
  return new Promise<AxiosResponse<any>>((resolve, reject) => {
    axiosInstance
      .post(`bus/create`, { ...busData })
      .then((resp) => {
        resolve(resp);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export interface IBus extends IBusCreate {
  _id: string;
  isAvailableForTrip?: boolean;
}
export function updateBusApi(newData: IBus) {
  return new Promise<AxiosResponse<any>>((resolve, reject) => {
    axiosInstance
      .put(`bus/update/${newData._id}`, { ...newData })
      .then((resp) => {
        resolve(resp);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function deleteBus(busId: string) {
  return new Promise<AxiosResponse<any>>((resolve, reject) => {
    axiosInstance
      .delete(`bus/delete/${busId}`)
      .then((resp) => {
        resolve(resp);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function toggleBusAvailable(busId: string) {
  return new Promise<AxiosResponse<any>>((resolve, reject) => {
    axiosInstance
      .patch(`bus/toggle-available/${busId}`)
      .then((resp) => {
        resolve(resp);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function getAllBuses() {
  return new Promise<AxiosResponse<any>>((resolve, reject) => {
    axiosInstance
      .get(`bus/get-buses`)
      .then((resp) => {
        resolve(resp);
      })
      .catch((err) => reject(err));
  });
}
