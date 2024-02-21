import hotkeys from 'hotkeys-js'
import EventEmitter from 'eventemitter3'
import { AsyncSeriesHook } from 'tapable'
import { assign, isArray } from 'lodash-es'
import { allFonts, setFontsStyle } from '../utils'
import type { fabric } from 'fabric'
import type { Plugin, PluginInstance, UsePlugin } from '../plugin'

interface EditorOptions {
  debug: boolean
}

interface Status {
  preview?: boolean
  change?: boolean
  ready?: boolean
  canEdit?: boolean
}

export class Editor extends EventEmitter {
  private _canvas?: fabric.Canvas
  // 编辑器状态
  private _status = {
    ready: false,
    preview: false,
    change: false,
    canEdit: false,
  }

  private _options: EditorOptions = { debug: false }
  private _pluginMap: Map<string, Plugin.BasePlugin> = new Map()

  // 自定义事件
  private _customEvents: string[] = []
  // 生命周期函数名
  private _hooks: Plugin.EditorHooksType[] = [
    'hookImportBefore',
    'hookImportAfter',
    'hookSaveBefore',
    'hookSaveAfter',
  ]

  /**
   * 返回 canvas
   */
  get canvas() {
    return this._canvas
  }

  /**
   * 获取配置
   */
  get config() {
    return this._options
  }

  /**
   * 更新编辑器选项
   * @param options
   */
  set config(options: EditorOptions) {
    assign(this._options, options)
  }

  private hooksEntity: Map<string, AsyncSeriesHook<any>> = new Map()

  /**
   * 初始化
   * @param canvas
   */
  init(canvas: fabric.Canvas) {
    this._canvas = canvas
    this._bindContextMenu()
    this._initActionHooks()
    // 监听编辑器状态
    this.once('ready', () => {
      this.updateStatus({ ready: true })
    })
    this.initFont()
  }

  /**
   * 获取 hookEntity
   * @param propName
   * @returns AsyncSeriesHook
   */
  getHooksEntity(propName: string) {
    return this.hooksEntity.get(propName)
  }

  /**
   * 使用插件
   * @param opt {UsePlugin}
   */
  use(opt: UsePlugin): Editor
  use(opt: UsePlugin[]): Editor
  use(opt: UsePlugin | UsePlugin[]): Editor {
    if (isArray(opt)) {
      opt.forEach((item) => {
        this.use(item)
      })
      return this
    }
    const { Ctor, options = {} } = opt
    const pluginRunTime = new Ctor(this._canvas!, this, options)
    if (this._checkPlugin(pluginRunTime)) {
      // 调用生命周期插件
      this._pluginMap.set(pluginRunTime.get('name'), pluginRunTime as PluginInstance[keyof PluginInstance])
      this._saveCustomAttr(pluginRunTime)
      this._bindingHooks(pluginRunTime)
      this._bindingHotkeys(pluginRunTime)
      // 注册插件成功
      pluginRunTime.mounted()
    }

    return this
  }

  // 获取插件
  getPlugin<T extends PluginInstance, K extends keyof PluginInstance>(name: K): T[K]
  getPlugin<T extends Plugin.BasePlugin>(name: string): T
  getPlugin<T = any>(name: any) {
    if (this._pluginMap.has(name)) {
      return this._pluginMap.get(name) as T
    }
  }

  /**
   * 异步获取插件
   * @param name
   */
  getPluginV2<T extends PluginInstance, K extends keyof PluginInstance>(name: K): Promise<T[K]>
  getPluginV2<T extends Plugin.BasePlugin>(name: string): Promise<T>
  getPluginV2<T = any>(name: any) {
    return new Promise((resolve) => {
      if (this._pluginMap.has(name)) {
        return resolve(this._pluginMap.get(name) as T)
      }
      else {
        this.once(`${name}:mounted`, () => {
          resolve(this._pluginMap.get(name) as T)
        })
      }
    })
  }

  /**
   * 设置选中元素
   * @param id
   */
  setActive(id: string) {
    const el = this._canvas?.getObjects().find(item => item.id === id)
    if (!el)
      return
    this._canvas?.setActiveObject(el)
    this._canvas?.requestRenderAll()
  }

  // 检查组件
  private _checkPlugin(plugin: Plugin.BasePlugin) {
    const pluginName = plugin.get('name')
    const events = plugin.get('events')
    // 名称检查
    if (this._pluginMap.has(pluginName)) {
      throw new Error(pluginName + '插件重复初始化')
    }
    events.forEach((eventName: string) => {
      if (this._customEvents.find(info => info === eventName)) {
        throw new Error(pluginName + '插件中' + eventName + '重复')
      }
    })
    return true
  }

  // 绑定hooks方法
  private _bindingHooks(plugin: Plugin.BasePlugin) {
    this._hooks.forEach((hookName) => {
      const hook = plugin[hookName]
      if (hook) {
        const name = plugin.get('name')
        this.hooksEntity.get(hookName)!.tapPromise(name + hookName, (...args) => {
          return hook.apply(plugin, args) as Promise<any>
        })
      }
    })
  }

  // 绑定快捷键
  private _bindingHotkeys(plugin: Plugin.BasePlugin) {
    const hotkeys_ = plugin.get('hotkeys')
    hotkeys_?.forEach((keyName: string) => {
      // 支持 keyup
      hotkeys(keyName, { keyup: true }, e => plugin.hotkeyEvent(keyName, e))
    })
  }

  /**
   * unbind
   * @param plugin
   */
  private _unbindHotkeys(plugin: Plugin.BasePlugin) {
    const hotkeys_ = plugin.get('hotkeys')
    hotkeys_?.forEach((keyName: string) => {
      hotkeys.unbind(keyName, e => plugin.hotkeyEvent(keyName, e))
    })
  }

  /**
   * 卸载 hook
   */
  private _unbindHooks() {
    this.hooksEntity.clear()
  }

  // 保存组件自定义事件与API
  private _saveCustomAttr(plugin: Plugin.BasePlugin) {
    const events = plugin.get('events')
    this._customEvents = this._customEvents.concat(events)
  }

  // 右键菜单
  private _bindContextMenu() {
    this._canvas!.on('mouse:down', (opt) => {
      // 右键菜单
      if (opt.button === 3) {
        const plugin = this.getPlugin('ContextMenuPlugin')
        // 调用菜单
        plugin?.showMenu(opt)
      }
    })
  }

  // 生命周期事件
  private _initActionHooks() {
    this._hooks.forEach((hookName) => {
      this.hooksEntity.set(hookName, new AsyncSeriesHook(['data']))
    })
  }

  /**
   * 初始化字体库
   */
  private initFont() {
    setFontsStyle(allFonts)
  }

  /**
   * 卸载编辑器
   */
  unMounted() {
    const plugins = this._pluginMap.values()
    for (const plugin of plugins) {
      // 解绑数据
      this._unbindHotkeys(plugin as Plugin.BasePlugin)
      // 调用插件自身卸载
      plugin.destroyed()
    }

    // 清除事件
    this._customEvents = []
    // 清除插件
    this._pluginMap.clear()
    // 卸载 hook
    this._unbindHooks()
    // 清除所有事件监听
    this.removeAllListeners()
  }

  /**
   * 更新 status
   * @param status
   */
  updateStatus(status: Status) {
    assign(this._status, status)
  }
}

/**
 * 创建编辑器
 * @returns Editor
 */
export const createCore = () => new Editor()
