import { AxiosResponse } from "axios";
import { axiosInstance } from "./baseApi";

export function tripCancellationApi(
  tripId: string,
  passengerId: string,
  passengerData: string[]
) {
  return new Promise<AxiosResponse<any>>((resolve, reject) => {
    axiosInstance
      .put(`trip/trip-cancel/trip/${tripId}/passenger/${passengerId}`, {
        passengerData,
      })
      .then((resp) => resolve(resp))
      .catch((err) => reject(err));
  });
}

export function getAllTripsApi() {
  return new Promise<AxiosResponse<any>>((resolve, reject) => {
    axiosInstance
      .get(`trip/get-all-trips`)
      .then((resp) => {
        resolve(resp);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export interface ITripCreate {
  busId: string;
  fromId: string;
  toId: string;
  price: string;
  departure_time?: Date;
}
export function createTripApi(tripData: ITripCreate) {
  return new Promise<AxiosResponse<any>>((resolve, reject) => {
    axiosInstance
      .post(`trip/create`, { ...tripData })
      .then((resp) => {
        resolve(resp);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

interface ITripUpdate {
  _id: string;
  busId?: string;
  fromId?: string;
  toId?: string;
  price?: string;
  departure_time?: Date;
}
export function updateTripApi(tripData: ITripUpdate) {
  const { _id, ...restData } = tripData;
  return new Promise<AxiosResponse<any>>((resolve, reject) => {
    axiosInstance
      .put(`trip/update-trip/${_id}`, { ...restData })
      .then((resp) => {
        resolve(resp);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function deleteTripApi(tripId: string) {
  return new Promise<AxiosResponse<any>>((resolve, reject) => {
    axiosInstance
      .delete(`trip/delete/${tripId}`)
      .then((resp) => {
        resolve(resp);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export const loginAdmin = async (data: { email: string; password: string }) => {
  return new Promise<AxiosResponse<any>>((resolve, reject) => {
    axiosInstance
      .post(`/login`, { ...data })
      .then((resp) => resolve(resp))
      .catch((err) => reject(err));
  });
};
