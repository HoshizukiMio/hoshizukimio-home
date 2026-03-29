/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Declarations for meting-js since it's a custom element
declare namespace JSX {
  interface IntrinsicElements {
    'meting-js': any
  }
}
