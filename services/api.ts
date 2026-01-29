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
export function isTokenAlive(token: string | null): boolean {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------
   BASE CLASS
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

  abstract getUserFullAccess(userId: string): Promise<any[]>;
  abstract syncUserAccess(userId: string, access: any[]): Promise<any>;

  // ✅ SINGLE DEVICE WS (MULTI DEVICE handled in hook)
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
  #wsChannels: Record<string, WebSocket> = {};

  constructor() {
    super();
    this.#host = import.meta.env.VITE_APP_API_URL_PREFIX || "http://localhost:8000/v1";
    console.log("🌍 API HOST:", this.#host);
  }

  setKeycloakToken(_: string) {}

  clearToken() {
    localStorage.removeItem("token");
  }

  #getHeaders() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // ✅ FIX: Handle absolute + relative URLs safely
  #buildUrl(endpoint: string) {
    if (!endpoint) throw new Error("Endpoint is undefined");
    return endpoint.startsWith("http") ? endpoint : `${this.#host}${endpoint}`;
  }

  async login(user: string, pwd: string) {
    const url = this.#buildUrl("/login");
    console.log("➡️ LOGIN URL:", url);

    const res = await axios.post(url, { username: user, password: pwd });
    localStorage.setItem("token", res.data.access_token);
    return res;
  }

  async isLoggedIn() {
    return !!localStorage.getItem("token");
  }

  async get(endpoint: string, payload?: any) {
    const url = this.#buildUrl(endpoint);
    console.log("➡️ GET:", url);

    return axios.get(url, {
      params: payload,
      headers: this.#getHeaders(),
    });
  }

  async post(endpoint: string, payload: any) {
    const url = this.#buildUrl(endpoint);
    console.log("➡️ POST:", url);

    return axios.post(url, payload, {
      headers: this.#getHeaders(),
    });
  }

  async put(endpoint: string, payload: any) {
    const url = this.#buildUrl(endpoint);
    console.log("➡️ PUT:", url);

    return axios.put(url, payload, {
      headers: this.#getHeaders(),
    });
  }

  async patch(endpoint: string, payload: any) {
    const url = this.#buildUrl(endpoint);
    console.log("➡️ PATCH:", url);

    return axios.patch(url, payload, {
      headers: this.#getHeaders(),
    });
  }

  async getRamanAnalysis(endpoint: string, payload?: any) {
    return this.get(endpoint, payload);
  }

  async getUserFullAccess(): Promise<any[]> {
    return [];
  }

  async syncUserAccess(): Promise<any> {
    return {};
  }

  /* ------------------------------------------------------------
     ✅ REALTIME DEVICE WEBSOCKET
  ------------------------------------------------------------ */
  connectDeviceWebSocket(deviceId: string, mqttTopic: string, onMessage: (data: any) => void) {
    if (this.#wsChannels[deviceId]) return;

    const topic = mqttTopic.replace("+", deviceId);
    const url = `wss://bw06.kaatru.org/stream/${topic}`;

    console.log("🔌 WS CONNECT:", deviceId, url);

    const ws = new WebSocket(url);
    this.#wsChannels[deviceId] = ws;

    ws.onopen = () => console.log("✅ WS OPEN:", deviceId);

    ws.onmessage = (event) => {
      try {
        const json = JSON.parse(event.data);
        if (!json?.data?.length) return;

        const payload = json.data[0];
        const v = payload.value;

        const deviceData = {
          id: deviceId,
          lat: Number(v.lat ?? 0),
          lon: Number(v.lon ?? v.long ?? 0),
          sPM2: Number(v.sPM2 ?? 0),
          sPM10: Number(v.sPM10 ?? 0),
          temp: Number(v.temp ?? 0),
          rh: Number(v.rh ?? 0),
          srvtime: Number(payload.srvtime ?? Date.now()),
        };

        console.log("📡 LIVE", deviceData);
        onMessage(deviceData);
      } catch (e) {
        console.error("WS PARSE ERROR", deviceId, e);
      }
    };

    ws.onerror = (e) => console.error("❌ WS ERROR", deviceId, e);
    ws.onclose = () => {
      console.warn("⚠️ WS CLOSED", deviceId);
      delete this.#wsChannels[deviceId];
    };
  }

  disconnectAllWebSockets() {
    Object.values(this.#wsChannels).forEach(ws => ws.close());
    this.#wsChannels = {};
  }
}

/* ------------------------------------------------------------
   MOCK API
------------------------------------------------------------ */
class Mock extends ApiService {
  clearToken() {}
  setKeycloakToken() {}
  async isLoggedIn() { return true; }
  async login() { return {}; }

  async get() { return {}; }
  async post() { return {}; }
  async put() { return {}; }
  async patch() { return {}; }
  async getRamanAnalysis() { return {}; }

  async getUserFullAccess() { return []; }
  async syncUserAccess() { return {}; }

  connectDeviceWebSocket(deviceId: string, mqttTopic: string, onMessage: any) {}
  disconnectAllWebSockets() {}
}

/* ------------------------------------------------------------
   EXPORT
------------------------------------------------------------ */
export const apiService: ApiService =
  import.meta.env.VITE_APP_STATE === "PRODUCTION"
    ? new Production()
    : new Mock();
