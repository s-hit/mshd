/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

/// <reference types="@amap/amap-jsapi-loader" >

import '@amap/amap-jsapi-types'
