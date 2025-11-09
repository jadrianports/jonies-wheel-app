/* eslint-disable  */
// Type declarations for *.vue files
// This tells TypeScript how to handle imports of .vue files in a Vite + Vue 3 project.
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
