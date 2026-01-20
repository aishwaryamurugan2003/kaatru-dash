/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_KEYCLOAK_TOKEN: string;
  readonly VITE_APP_STATE: string;
  readonly VITE_APP_API_URL_PREFIX: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
