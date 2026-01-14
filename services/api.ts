/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { type AxiosResponse } from "axios";
import { customHistory } from "../history";

/* ------------------------------------------------------------
   ENDPOINT CONSTANTS
------------------------------------------------------------ */
export const Endpoint = {
  FETCH_DATA_ANALYSIS: "/spatio-temporal/raw",

  // FULL URL ENDPOINTS
  KEYCLOAK_USERS: "https://caas.kaatru.org/keycloak/users",
  GROUP_ALL: "https://bw04.kaatru.org/group/all",
  GROUP_DEVICES: "https://bw04.kaatru.org/group",

  ACCESS_MANAGEMENT: "https://caas.kaatru.org/admin/access-management",

  // ⭐ NEW SYNC ENDPOINT
  ACCESS_MANAGEMENT_SYNC: "https://caas.kaatru.org/admin/access-management/sync",
} as const;

/* ------------------------------------------------------------
   Base Abstract Class
------------------------------------------------------------ */
abstract class ApiService {
  abstract isLoggedIn(): Promise<boolean>;
  abstract login(user: string, pwd: string): Promise<AxiosResponse | any>;
  abstract setKeycloakToken(token: string): void;

  abstract get(endpoint: string, payload?: Record<string, any>): Promise<any>;
  abstract post(endpoint: string, payload: any, params?: Record<string, any>): Promise<any>;
  abstract patch(endpoint: string, payload: any): Promise<any>;
  abstract put(endpoint: string, payload: any, params?: Record<string, any>): Promise<any>;
  abstract getRamanAnalysis(endpoint: string, payload?: Record<string, any>): Promise<any>;
}

/* ------------------------------------------------------------
   PRODUCTION IMPLEMENTATION
------------------------------------------------------------ */
class Production extends ApiService {
  #host: string;

  // ⭐ SPECIAL TOKEN FOR KEYCLOAK USERS API
  #keycloakToken: string | null = null;

  constructor() {
    super();
    const prefix = import.meta.env.VITE_APP_API_URL_PREFIX || "";

    this.#host = prefix.length === 0 ? "http://localhost:8000/v1" : prefix;

    console.log("Backend Host:", this.#host);
  }

  /* ------------------------------------------------------------
     Allows App.tsx to inject the Keycloak Token
  ------------------------------------------------------------ */
  setKeycloakToken(token: string) {
    this.#keycloakToken = token;
  }

  /* ------------------------------------------------------------
     Resolve API URL
  ------------------------------------------------------------ */
  #resolveUrl(endpoint: string): string {
    if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
      return endpoint; // full URL
    }
    return `${this.#host}${endpoint}`;
  }

  /* ------------------------------------------------------------
     Select Correct Token Based on Endpoint
  ------------------------------------------------------------ */
  #getHeaders(endpoint?: string): Record<string, string> {
    const backendToken =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    // ⭐ THESE ENDPOINTS REQUIRE KEYCLOAK TOKEN
    if (
      endpoint === Endpoint.KEYCLOAK_USERS ||
      endpoint === Endpoint.ACCESS_MANAGEMENT ||
      endpoint === Endpoint.ACCESS_MANAGEMENT_SYNC  // ⭐ ADDED
    ) {
      return {
        Authorization: `Bearer ${this.#keycloakToken ?? ""}`,
      };
    }

    // Default token
    return {
      Authorization: `Bearer ${backendToken ?? ""}`,
    };
  }

  /* ------------------------------------------------------------
     LOGIN
  ------------------------------------------------------------ */
  async login(user: string, pwd: string): Promise<any> {
    try {
      const res = await axios.post(`${this.#host}/login`, {
        username: user,
        password: pwd,
      });

      localStorage.setItem("token", res.data.access_token);
      return res;
    } catch (e: any) {
      return {
        status: e.response?.status,
        data: e.response?.data?.detail,
      };
    }
  }

  /* ------------------------------------------------------------
     GET
  ------------------------------------------------------------ */
  async get(endpoint: string, payload?: Record<string, any>): Promise<any> {
    try {
      const url = this.#resolveUrl(endpoint);

      return await axios.get(url, {
        params: payload ?? {},
        headers: this.#getHeaders(endpoint),
      });
    } catch (e: any) {
      console.error("GET ERROR:", e);
      return e.response;
    }
  }

  /* ------------------------------------------------------------
     GET (RAMAN)
  ------------------------------------------------------------ */
  async getRamanAnalysis(endpoint: string, payload?: Record<string, any>): Promise<any> {
    try {
      const url = this.#resolveUrl(endpoint);

      return await axios.get(url, {
        params: payload ?? {},
        headers: this.#getHeaders(endpoint),
      });
    } catch (e: any) {
      console.error("RAMAN ERROR:", e);
      return e.response;
    }
  }

  /* ------------------------------------------------------------
     POST
  ------------------------------------------------------------ */
  async post(endpoint: string, payload: any, params: Record<string, any> = {}): Promise<any> {
    try {
      const url = this.#resolveUrl(endpoint);

      return await axios.post(url, payload, {
        params,
        headers: this.#getHeaders(endpoint),
      });
    } catch (e: any) {
      return e.response;
    }
  }

  /* ------------------------------------------------------------
     PUT
  ------------------------------------------------------------ */
  async put(endpoint: string, payload: any, params: Record<string, any> = {}): Promise<any> {
    try {
      const url = this.#resolveUrl(endpoint);

      return await axios.put(url, payload, {
        params,
        headers: this.#getHeaders(endpoint),
      });
    } catch (e: any) {
      return e.response;
    }
  }

  /* ------------------------------------------------------------
     PATCH
  ------------------------------------------------------------ */
  async patch(endpoint: string, payload: any): Promise<any> {
    try {
      const url = this.#resolveUrl(endpoint);

      return await axios.patch(url, payload, {
        headers: this.#getHeaders(endpoint),
      });
    } catch (e: any) {
      return e.response;
    }
  }

  async isLoggedIn(): Promise<boolean> {
    return !!(
      localStorage.getItem("token") || sessionStorage.getItem("token")
    );
  }
}

/* ------------------------------------------------------------
   MOCK API
------------------------------------------------------------ */
class Mock extends ApiService {
  setKeycloakToken(): void {}
  async isLoggedIn(): Promise<boolean> { return true; }
  async login(): Promise<any> { return { data: { access_token: "mock" } }; }
  async get(): Promise<any> { return { data: [] }; }
  async post(): Promise<any> { return { data: {} }; }
  async patch(): Promise<any> { return { data: {} }; }
  async put(): Promise<any> { return { data: {} }; }
  async getRamanAnalysis(): Promise<any> { return { data: [] }; }
}

/* ------------------------------------------------------------
   EXPORT INSTANCE
------------------------------------------------------------ */
export const apiService: ApiService =
  import.meta.env.VITE_APP_STATE === "PRODUCTION"
    ? new Production()
    : new Mock();
