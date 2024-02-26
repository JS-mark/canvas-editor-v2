/*
 * @Author: Mark
 * @Date: 2023-06-20 13:06:31
 * @LastEditors: Mark
 * @LastEditTime: 2024-02-26 15:16:48
 * @Description: 历史记录插件
 */
import { ref } from 'vue'
import type { fabric } from 'fabric'
import { useRefHistory } from '@vueuse/core'
import { type Editor, Plugin } from '@tm2js/canvas-editor'

export class HistoryPlugin extends Plugin.BasePlugin {
  get name() {
    return 'HistoryPlugin'
  }

  get events() {
    return ['historyInitSuccess']
  }

  get hotkeys() {
    return ['ctrl+z', 'ctrl+shift+z', '⌘+z', '⌘+shift+z']
  }

  history: any

  constructor(canvas: fabric.Canvas, editor: Editor, options: Plugin.Options) {
    super(canvas, editor, options)

    // 无限制
    this.history = useRefHistory(ref(), {})
  }

  async mounted() {
    // 监听浏览器离开
    // window.addEventListener('beforeunload', (e) => {
    //   if (history.length > 0) {
    //     (e || window.event).returnValue = '确认离开'
    //   }
    // })
    this._canvas.on('object:added', (event: fabric.IEvent) => this._save(event))
    this._canvas.on('object:modified', (event: fabric.IEvent) => this._save(event))
    this._canvas.on('object:moving', (event: fabric.IEvent) => this._save(event))
    this._canvas.on('object:scaling', (event: fabric.IEvent) => this._save(event))
    this._canvas.on('object:rotating', (event: fabric.IEvent) => this._save(event))
    this._canvas.on('object:skewing', (event: fabric.IEvent) => this._save(event))
    this._canvas.on('object:resizing', (event: fabric.IEvent) => this._save(event))
    this._canvas.on('selection:updated', (event: fabric.IEvent) => this._save(event))
    this._editor.emit(`${this.name}:mounted`)
  }

  async destroyed() {
    this._canvas.off('object:added', (event: fabric.IEvent) => this._save(event))
    this._canvas.off('object:modified', (event: fabric.IEvent) => this._save(event))
    this._canvas.off('object:moving', (event: fabric.IEvent) => this._save(event))
    this._canvas.off('object:scaling', (event: fabric.IEvent) => this._save(event))
    this._canvas.off('object:rotating', (event: fabric.IEvent) => this._save(event))
    this._canvas.off('object:skewing', (event: fabric.IEvent) => this._save(event))
    this._canvas.off('object:resizing', (event: fabric.IEvent) => this._save(event))
    this._canvas.off('selection:updated', (event: fabric.IEvent) => this._save(event))
  }

  getHistory() {
    return this.history
  }

  clear() {
    this.history.clear()
  }

  _save(event: any) {
    // 过滤选择元素事件
    const isSelect = event.action === undefined && event.e
    if (isSelect || !this._canvas)
      return
    const workspace = this._canvas.getObjects().find((item) => {
      return item.name === 'workspace' && item.id === 'workspace'
    })
    if (!workspace) {
      return
    }
    if (this.history.isTracking.value) {
      this.history.source.value = this._editor.getPlugin('ServersPlugin')?.getJson()
    }
  }

  undo() {
    if (this.history.canUndo.value) {
      this.renderCanvas()
      this.history.undo()
    }
  }

  redo() {
    this.history.redo()
    this.renderCanvas()
  }

  renderCanvas = () => {
    this.history.pause()
    this._canvas.loadFromJSON(this.history.source.value, () => {
      this._canvas.renderAll()
      this.history.resume()
    })
  }

  // 快捷键扩展回调
  hotkeyEvent(eventName: string, e: KeyboardEvent) {
    if (e.type === 'keydown') {
      switch (eventName) {
        case 'ctrl+z':
        case '⌘+z':
          this.undo()
          break
        case 'ctrl+shift+z':
        case '⌘+shift+z':
          this.redo()
          break
      }
    }
  }
}
