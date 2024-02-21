import { nanoid } from 'nanoid'
import type { fabric } from 'fabric'
import type { Editor } from '../../core'

export namespace Plugin {
  export interface Lifecycle {
    mounted(): Promise<void>
    destroyed(): Promise<void>
  }

  export type EditorHooksType =
    | 'hookImportBefore'
    | 'hookImportAfter'
    | 'hookSaveBefore'
    | 'hookSaveAfter'

  export type PluginCtor<T> = new (canvas: fabric.Canvas, editor: Editor, options: Options) => T extends new (canvas: fabric.Canvas, editor: Editor, options: Options) => infer R ? R : any

  export type Options = Exposed<Record<string, any>>

  export type Exposed<T> = { [K in keyof T]: T[K] }

  export type BasePluginParameters = ConstructorParameters<typeof Plugin.BasePlugin>

  export interface Base {
    readonly _canvas: fabric.Canvas
    readonly _editor: Editor
    readonly _options: Options
  }

  export type IEditorHooks<T = any> = {
    [key in Plugin.EditorHooksType]?: (...args: T[]) => Promise<any>
  }

  export type PluginOptions = ConstructorParameters<typeof BasePlugin>

  export abstract class BasePlugin implements Base, Lifecycle, IEditorHooks {
    public readonly _canvas: fabric.Canvas
    public readonly _editor: Editor
    public readonly _options: Options
    // 伪造新方法
    [key: string]: any
    // 插件名称
    protected abstract get name(): string
    // 事件
    protected abstract get events(): string[]
    protected abstract get hotkeys(): string[]
    /**
     *
     */
    constructor(canvas: fabric.Canvas, editor: Editor, options: Options) {
      this._canvas = canvas
      this._editor = editor
      this._options = options
    }

    hookImportBefore(...args: any[]) {
      return new Promise((resolve) => { resolve(args) })
    }

    hookImportAfter(...args: any[]) {
      return new Promise((resolve) => { resolve(args) })
    }

    hookSaveBefore(...args: any[]) {
      return new Promise((resolve) => { resolve(args) })
    }

    hookSaveAfter(...args: any[]) {
      return new Promise((resolve) => { resolve(args) })
    }

    /**
     * 生成组件 id
     * @returns string
     */
    genUid() {
      return nanoid()
    }

    /**
     * 组件名称
     */
    genName() {
      return `组件__${this.genUid()}`
    }

    /**
     * 快捷键调用
     * @param eventName
     * @param event
     */
    hotkeyEvent(eventName: string, event?: Event) {
      console.warn('hotkeyEvent', eventName, event)
    }

    get(type: 'name'): string
    get(type: 'events'): string[]
    get(type: 'hotkeys'): string[]
    get(type: 'name' | 'events' | 'hotkeys'): string | string[] {
      return this[type]
    }

    mounted(): Promise<void> {
      return new Promise((resolve) => { resolve() })
    }

    destroyed(): Promise<void> {
      return new Promise((resolve) => { resolve() })
    }
  }
}
