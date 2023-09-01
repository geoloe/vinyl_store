/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OAUTH_TOKEN: string
  readonly VITE_OAUTH_TOKEN_SECRET: string
  readonly VITE_DISCOGS_API_KEY: string
  readonly VITE_OAUTH_CONSUMER_KEY: string
  readonly VITE_OAUTH_CONSUMER_SECRET: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}