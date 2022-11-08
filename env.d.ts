// 用来给环境变量提供智能提示
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PROXY_URL: string
  // 更多环境变量...
}