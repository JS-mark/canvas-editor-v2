/// <reference types="vite/client" />

import type { Editor } from "core";


declare global {
  export interface Window {
    __canvas_editor: {
      version: string
      core: Editor
    }
  }
  declare module 'fabric/fabric-impl' {
    interface IObjectOptions {
      /**
       * 标识
       */
      id?: string | undefined;
    }
  }
}
