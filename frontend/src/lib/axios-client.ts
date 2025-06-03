import axios from "axios";
import { useStore } from "@/store/store";
import { CustomError } from "@/types/custom-error.type";
import { ENV } from "./get-env";

const baseURL = ENV.VITE_API_BASE_URL;

const options = {
  baseURL,
  withCredentials: true,
  timeout: 10000,
};

//*** FOR API WITH TOKEN */
export const API = axios.create(options);

API.interceptors.request.use((config) => {
  const accessToken = useStore.getState().accessToken;
  if (accessToken) {
    config.headers["Authorization"] = "Bearer " + accessToken;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      const { data, status } = error.response;
      if (data === "Unauthorized" && status === 401) {
        const store = useStore.getState();
        store.clearUser();
        store.clearAccessToken();
        store.clearExpiresAt();
        window.location.href = "/";
      }

      const customError: CustomError = {
        ...error,
        message: data?.message || "An error occurred",
        errorCode: data?.errorCode || "UNKNOWN_ERROR",
      };

      return Promise.reject(customError);
    }

    // Handle network errors or other cases where error.response is undefined
    const customError: CustomError = {
      ...error,
      message: error.message || "Network error occurred",
      errorCode: "NETWORK_ERROR",
    };

    return Promise.reject(customError);
  }
);

//*** FOR API DONT NEED TOKEN */
export const PublicAPI = axios.create(options);

PublicAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      const { data } = error.response;
      const customError: CustomError = {
        ...error,
        message: data?.message || "An error occurred",
        errorCode: data?.errorCode || "UNKNOWN_ERROR",
      };
      return Promise.reject(customError);
    }

    // Handle network errors or other cases where error.response is undefined
    const customError: CustomError = {
      ...error,
      message: error.message || "Network error occurred",
      errorCode: "NETWORK_ERROR",
    };

    return Promise.reject(customError);
  }
);
