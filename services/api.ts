/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { type AxiosResponse } from "axios";

/* ------------------------------------------------------------
   ENDPOINT CONSTANTS
------------------------------------------------------------ */
export const Endpoint = {
  FETCH_DATA_ANALYSIS: "/spatio-temporal/raw",

  KEYCLOAK_USERS: "https://caas.kaatru.org/keycloak/users",
  GROUP_ALL: "https://bw04.kaatru.org/group/all",
  GROUP_DEVICES: "https://bw04.kaatru.org/group",

  ACCESS_MANAGEMENT: "https://caas.kaatru.org/admin/access-management",
  ACCESS_MANAGEMENT_SYNC: "https://caas.kaatru.org/admin/access-management/sync",
} as const;

/* ------------------------------------------------------------
   JWT UTILITY
------------------------------------------------------------ */
function isTokenAlive(token: string | null): boolean {
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------
   Base Abstract Class
------------------------------------------------------------ */
abstract class ApiService {
  abstract isLoggedIn(): Promise<boolean>;
  abstract login(user: string, pwd: string): Promise<AxiosResponse | any>;
  abstract setKeycloakToken(token: string): void;
  abstract clearToken(): void;

  abstract get(endpoint: string, payload?: Record<string, any>): Promise<any>;
  abstract post(endpoint: string, payload: any, params?: Record<string, any>): Promise<any>;
  abstract put(endpoint: string, payload: any, params?: Record<string, any>): Promise<any>;
  abstract patch(endpoint: string, payload: any): Promise<any>;
  abstract getRamanAnalysis(endpoint: string, payload?: Record<string, any>): Promise<any>;

  /* 🔑 NEW HELPERS */
  abstract getUserFullAccess(userId: string): Promise<any[]>;
  abstract syncUserAccess(userId: string, access: any[]): Promise<any>;
}

/* ------------------------------------------------------------
   PRODUCTION IMPLEMENTATION
------------------------------------------------------------ */
class Production extends ApiService {
  #host: string;
  #keycloakToken: string | null = null;

  constructor() {
    super();
    const prefix = import.meta.env.VITE_APP_API_URL_PREFIX || "";
    this.#host = prefix.length === 0 ? "http://localhost:8000/v1" : prefix;
  }

  clearToken(): void {
    this.#keycloakToken = null;
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
  }

  setKeycloakToken(token: string) {
    this.#keycloakToken = token;
  }

  #resolveUrl(endpoint: string): string {
    if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
      return endpoint;
    }
    return `${this.#host}${endpoint}`;
  }

  #getHeaders(endpoint?: string): Record<string, string> | null {
    const backendToken =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    const isKeycloakEndpoint =
      endpoint === Endpoint.KEYCLOAK_USERS ||
      endpoint.startsWith(Endpoint.ACCESS_MANAGEMENT);

    if (isKeycloakEndpoint) {
      if (!isTokenAlive(this.#keycloakToken)) {
        console.warn("Keycloak token expired → skipping API call");
        return null;
      }

      return {
        Authorization: `Bearer ${this.#keycloakToken}`,
      };
    }

    return {
      Authorization: `Bearer ${backendToken ?? ""}`,
    };
  }

  /* ------------------------------------------------------------
     AUTH
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

  async isLoggedIn(): Promise<boolean> {
    return !!(
      localStorage.getItem("token") || sessionStorage.getItem("token")
    );
  }

  /* ------------------------------------------------------------
     BASIC HTTP
  ------------------------------------------------------------ */
  async get(endpoint: string, payload?: Record<string, any>): Promise<any> {
    const headers = this.#getHeaders(endpoint);
    if (!headers) return null;

    return axios.get(this.#resolveUrl(endpoint), {
      params: payload ?? {},
      headers,
    });
  }

  async post(endpoint: string, payload: any, params: Record<string, any> = {}): Promise<any> {
    const headers = this.#getHeaders(endpoint);
    if (!headers) return null;

    return axios.post(this.#resolveUrl(endpoint), payload, {
      params,
      headers,
    });
  }

  async put(endpoint: string, payload: any, params: Record<string, any> = {}): Promise<any> {
    const headers = this.#getHeaders(endpoint);
    if (!headers) return null;

    return axios.put(this.#resolveUrl(endpoint), payload, {
      params,
      headers,
    });
  }

  async patch(endpoint: string, payload: any): Promise<any> {
    const headers = this.#getHeaders(endpoint);
    if (!headers) return null;

    return axios.patch(this.#resolveUrl(endpoint), payload, {
      headers,
    });
  }

  async getRamanAnalysis(endpoint: string, payload?: Record<string, any>): Promise<any> {
    const headers = this.#getHeaders(endpoint);
    if (!headers) return null;

    return axios.get(this.#resolveUrl(endpoint), {
      params: payload ?? {},
      headers,
    });
  }

  /* ------------------------------------------------------------
     🔑 NEW: ACCESS MANAGEMENT HELPERS
  ------------------------------------------------------------ */

  // ✅ SINGLE SOURCE OF TRUTH
async getUserFullAccess(userId: string): Promise<any[]> {
  const headers = this.#getHeaders(Endpoint.ACCESS_MANAGEMENT);
  if (!headers) return [];

  const res = await axios.get(Endpoint.ACCESS_MANAGEMENT, { headers });

  const user = res.data.find((u: any) => u.user_id === userId);
  return user?.access || [];
}


  // ✅ SAFE SYNC (FULL PAYLOAD ONLY)
  async syncUserAccess(userId: string, access: any[]): Promise<any> {
    const payload = {
      user_id: userId,
      access,
    };

    console.log(
      "SYNC USER ACCESS PAYLOAD:",
      JSON.stringify(payload, null, 2)
    );

    return this.put(Endpoint.ACCESS_MANAGEMENT_SYNC, payload);
  }
}

/* ------------------------------------------------------------
   MOCK API
------------------------------------------------------------ */
class Mock extends ApiService {
  clearToken(): void {}
  setKeycloakToken(): void {}

  async isLoggedIn(): Promise<boolean> {
    return true;
  }

  async login(): Promise<any> {
    return { data: { access_token: "mock" } };
  }

  async get(): Promise<any> {
    return { data: [] };
  }

  async post(): Promise<any> {
    return { data: {} };
  }

  async put(): Promise<any> {
    return { data: {} };
  }

  async patch(): Promise<any> {
    return { data: {} };
  }

  async getRamanAnalysis(): Promise<any> {
    return { data: [] };
  }

  async getUserFullAccess(): Promise<any[]> {
    return [];
  }

  async syncUserAccess(): Promise<any> {
    return { data: {} };
  }
}

/* ------------------------------------------------------------
   EXPORT INSTANCE
------------------------------------------------------------ */
export const apiService: ApiService =
  import.meta.env.VITE_APP_STATE === "PRODUCTION"
    ? new Production()
    : new Mock();
