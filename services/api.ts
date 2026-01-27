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

  /* 🔑 ACCESS HELPERS */
  abstract getUserFullAccess(userId: string): Promise<any[]>;
  abstract syncUserAccess(userId: string, access: any[]): Promise<any>;

  /* 🔥 REALTIME WEBSOCKET */
  abstract connectDeviceWebSocket(
    deviceId: string,
    mqttTopic: string,
    onMessage: (data: any) => void
  ): void;

  abstract disconnectAllWebSockets(): void;
}

/* ------------------------------------------------------------
   PRODUCTION IMPLEMENTATION
------------------------------------------------------------ */
class Production extends ApiService {
  #host: string;
  #keycloakToken: string | null = null;

  // 🔥 WebSocket channels storage
  #wsChannels: Record<string, WebSocket> = {};

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
    const token = localStorage.getItem("token");

    if (!token) {
      console.warn("❌ No token found");
      return null;
    }

    return {
      Authorization: `Bearer ${token}`,
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
     🔑 ACCESS MANAGEMENT
  ------------------------------------------------------------ */
  async getUserFullAccess(userId: string): Promise<any[]> {
    const headers = this.#getHeaders(Endpoint.ACCESS_MANAGEMENT);
    if (!headers) return [];

    const res = await axios.get(Endpoint.ACCESS_MANAGEMENT, { headers });
    const user = res.data.find((u: any) => u.user_id === userId);
    return user?.access || [];
  }

  async syncUserAccess(userId: string, access: any[]): Promise<any> {
    const payload = { user_id: userId, access };
    console.log("SYNC USER ACCESS PAYLOAD:", JSON.stringify(payload, null, 2));
    return this.put(Endpoint.ACCESS_MANAGEMENT_SYNC, payload);
  }

  /* ------------------------------------------------------------
     🔥 REALTIME DEVICE WEBSOCKET
  ------------------------------------------------------------ */
  connectDeviceWebSocket(
    deviceId: string,
    mqttTopic: string,
    onMessage: (data: any) => void
  ) {
    if (this.#wsChannels[deviceId]) return;

    const topic = mqttTopic.replace("+", deviceId);
    const url = `wss://bw06.kaatru.org/stream/${topic}`;

    console.log("🔌 WS CONNECT:", url);

    const ws = new WebSocket(url);
    this.#wsChannels[deviceId] = ws;

    ws.onopen = () => console.log("✅ WS OPEN:", deviceId);

    ws.onmessage = (event) => {
      try {
        const json = JSON.parse(event.data);
        if (!json?.data?.length) return;

        const v = json.data[0].value;
        const srvtime = json.data[0].srvtime;

        const payload = {
          id: deviceId,
          lat: v.lat ?? 0,
          lon: v.lon ?? v.long ?? 0,
          sPM2: Number(v.sPM2 ?? 0),
          sPM10: Number(v.sPM10 ?? 0),
          temp: Number(v.temp ?? 0),
          rh: Number(v.rh ?? 0),
          srvtime,
        };

        onMessage(payload);
      } catch (err) {
        console.error("❌ WS PARSE ERROR:", err);
      }
    };

    ws.onerror = (e) => console.error("❌ WS ERROR:", deviceId, e);

    ws.onclose = () => {
      console.warn("⚠️ WS CLOSED:", deviceId);
      delete this.#wsChannels[deviceId];
    };
  }

  disconnectAllWebSockets() {
    Object.values(this.#wsChannels).forEach((ws) => ws.close());
    this.#wsChannels = {};
    console.log("🧹 All WebSockets disconnected");
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

  connectDeviceWebSocket(): void {}
  disconnectAllWebSockets(): void {}
}

/* ------------------------------------------------------------
   EXPORT INSTANCE
------------------------------------------------------------ */
export const apiService: ApiService =
  import.meta.env.VITE_APP_STATE === "PRODUCTION"
    ? new Production()
    : new Mock();
