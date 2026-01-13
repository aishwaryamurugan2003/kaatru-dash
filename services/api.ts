/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { type AxiosResponse } from "axios";
import { customHistory } from "../history";

// Define endpoint constants
export const Endpoint = {
  FETCH_DATA_ANALYSIS: "/spatio-temporal/raw",

  
} as const;

// ------------------------------------------------------------
// Base abstract class
// ------------------------------------------------------------

abstract class ApiService {
  abstract isLoggedIn(): Promise<boolean>;
  abstract login(user: string, pwd: string): Promise<AxiosResponse | any>;
  abstract get(
    endpoint: string,
    payload?: Record<string, any>
  ): Promise<AxiosResponse | any>;
  abstract post(
    endpoint: string,
    payload: any,
    params?: Record<string, any>
  ): Promise<AxiosResponse | any>;
  abstract patch(
    endpoint: string,
    payload: any
  ): Promise<AxiosResponse | any>;

  abstract put(
    endpoint: string,
    payload: any,
    params: any
  ): Promise<AxiosResponse | any>;
}

// ------------------------------------------------------------
// Production API class
// ------------------------------------------------------------

class Production extends ApiService {
  #host: string;
  #ramanapihost: string;

  constructor() {
    super();
    const prefix = import.meta.env.VITE_APP_API_URL_PREFIX || "";
    this.#host =
      prefix.length === 0 ? "http://localhost:8000/v1" : prefix;
    this.#ramanapihost = prefix;
    console.log("the host is", prefix.length);
  }

  async isLoggedIn(): Promise<boolean> {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    return token !== null;
  }

  async login(user: string, pwd: string): Promise<AxiosResponse | any> {
    try {
      const res = await axios.post(`${this.#host}${Endpoint.LOGIN}`, {
        username: user,
        password: pwd,
      });
      localStorage.setItem("token", res.data.access_token);
      return res;
    } catch (e: any) {
      console.error(e);
      return {
        status: e.response?.status,
        data: e.response?.data?.detail,
      };
    }
  }

  async getRamanAnalysis(
    endpoint: string,
    payload?: Record<string, any>
  ): Promise<AxiosResponse | any> {
    try {
      const res = await axios.get(`${this.#ramanapihost}${endpoint}`, {
        params: payload ?? {},
        headers: this.#getHeaders(),
      });
      return res;
    } catch (e: any) {
      console.error(e);
      return e.response;
    }
  }

  async get(endpoint: string, payload?: Record<string, any>): Promise<any> {
    try {
      const res = await axios.get(`${this.#host}${endpoint}`, {
        params: payload ?? {},
        headers: this.#getHeaders(),
      });
      return res;
    } catch (e: any) {
      console.error(e);
      if (e.response) {
        return { status: e.response.status, data: e.response.data.detail };
      } else {
        customHistory.push("/");
        return { status: 401, data: "UnAuthorized" };
      }
    }
  }

  async post(
    endpoint: string,
    payload: any,
    params: Record<string, any> = {}
  ): Promise<any> {
    try {
      const res = await axios.post(`${this.#host}${endpoint}`, payload, {
        params,
        headers: this.#getHeaders(),
      });
      return res;
    } catch (e: any) {
      console.error(e);
      if (e.response) {
        return { status: e.response.status, data: e.response.data.detail };
      } else {
        customHistory.push("/");
        return { status: 401, data: "UnAuthorized" };
      }
    }
  }

  async uploadFile(
    endpoint: string,
    formData: FormData,
  ): Promise<any> {
    try {
      const res = await axios.post(`${this.#host}${endpoint}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...this.#getHeaders(),
        },
      });
      return res;
    } catch (e: any) {
      console.error(e);
      return e.response;
    }
  }

  async put(
    endpoint: string,
    payload: any,
    params: Record<string, any> = {}
  ): Promise<any> {
    try {
      const res = await axios.put(`${this.#host}${endpoint}`, payload, {
        params,
        headers: this.#getHeaders(),
      });
      return res;
    } catch (e: any) {
      console.error(e);
      if (e.response) {
        return { status: e.response.status, data: e.response.data.detail };
      } else {
        customHistory.push("/");
        return { status: 401, data: "UnAuthorized" };
      }
    }
  }

  async delete(
    endpoint: string,
    payload?: Record<string, any>,
  ): Promise<any> {
    try {
      const res = await axios.delete(`${this.#host}${endpoint}`, {
        params: payload ?? {},
        headers: this.#getHeaders(),
      });
      return res;
    } catch (e: any) {
      console.error(e);
      return e.response;
    }
  }

  async uploadFiles(endpoint: string, payload: FormData): Promise<any> {
    try {
      const res = await axios.post(`${this.#host}${endpoint}`, payload, {
        headers: {
          ...this.#getHeaders(),
          "Content-Type": "multipart/form-data",
        },
      });
      return res;
    } catch (e: any) {
      console.error(e);
      return e.response;
    }
  }

  async patch(endpoint: string, payload: any): Promise<any> {
    try {
      const res = await axios.patch(`${this.#host}${endpoint}`, payload, {
        headers: this.#getHeaders(),
      });
      return res;
    } catch (e: any) {
      console.error(e);
      if (e.response) {
        return { status: e.response.status, data: e.response.data.detail };
      } else {
        customHistory.push("/");
        return { status: 401, data: "UnAuthorized" };
      }
    }
  }

  async put(endpoint: string, payload: any, params = {}) {
    try {
      const res = await axios.put(
        `${this.#host}${endpoint}`,
        payload, // request body
        {
          params, // query parameters
          headers: this.#getHeaders(),
        }
      );
      return res;
    } catch (e) {
      console.log(e);
      // Network-level errors (no response from server)
      if (e.response) {
        return { status: e.response.status, data: e.response.data.detail };
      } else {
        customHistory.push("/");
        return { status: 401, data: "UnAuthorized" };
      }
    }
  }

  #getHeaders(): Record<string, string> {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    return { Authorization: `Bearer ${token ?? ""}` };
  }
}

// ------------------------------------------------------------
// Mock Class Placeholder (Optional)
// ------------------------------------------------------------
class Mock extends ApiService {
  async isLoggedIn(): Promise<boolean> {
    return true;
  }

  async login(): Promise<any> {
    return { data: { access_token: "mock_token" } };
  }

  async get(): Promise<any> {
    return { data: [] };
  }

  async post(): Promise<any> {
    return { data: {} };
  }

  async patch(): Promise<any> {
    return { data: {} };
  }
}

// ------------------------------------------------------------
// Export API Service Instance
// ------------------------------------------------------------
export const apiService: ApiService =
  import.meta.env.VITE_APP_STATE === "PRODUCTION"
    ? new Production()
    : new Mock();
