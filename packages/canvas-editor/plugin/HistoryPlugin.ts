/*
 * @Author: Mark
 * @Date: 2023-06-20 13:06:31
 * @LastEditors: Mark
 * @LastEditTime: 2024-01-29 22:40:11
 * @Description: 历史记录插件
 */
import type { fabric } from 'fabric'
import type { Editor } from '../core'
import { Plugin } from './createPlugin'

interface HistoryOptions {
  historySize: number
}

interface HistoryData {
  version: string;
  objects: fabric.Object[];
}

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

  private _undoStack: HistoryData[] = []
  private _redoStack: HistoryData[] = []
  private _isProgrammaticChange = false

  constructor(canvas: fabric.Canvas, editor: Editor, options: Plugin.Options & HistoryOptions) {
    super(canvas, editor, options)
  }

  async mounted() {
    // 监听浏览器离开
    // window.addEventListener('beforeunload', (e) => {
    //   if (history.length > 0) {
    //     (e || window.event).returnValue = '确认离开'
    //   }
    // })
    this._canvas.on({
      'object:added': (event: fabric.IEvent) => this._onChange(event),
      'object:modified': (event: fabric.IEvent) => this._onChange(event),
      'object:moving': (event: fabric.IEvent) => this._onChange(event),
      'object:scaling': (event: fabric.IEvent) => this._onChange(event),
      'object:rotating': (event: fabric.IEvent) => this._onChange(event),
      'object:skewing': (event: fabric.IEvent) => this._onChange(event),
      'object:resizing': (event: fabric.IEvent) => this._onChange(event),
      'selection:updated': (event: fabric.IEvent) => this._onChange(event),
    })
  }

  async destroyed() {
    this._canvas.off({
      'object:added': (event: fabric.IEvent) => this._onChange(event),
      'object:modified': (event: fabric.IEvent) => this._onChange(event),
      'object:moving': (event: fabric.IEvent) => this._onChange(event),
      'object:scaling': (event: fabric.IEvent) => this._onChange(event),
      'object:rotating': (event: fabric.IEvent) => this._onChange(event),
      'object:skewing': (event: fabric.IEvent) => this._onChange(event),
      'object:resizing': (event: fabric.IEvent) => this._onChange(event),
      'selection:updated': (event: fabric.IEvent) => this._onChange(event),
    })
  }

  private _onChange(event: fabric.IEvent) {
    if (this._isProgrammaticChange) return;
    this._save(event);
    this._redoStack = [];
  }

  private _save(event: fabric.IEvent) {
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


    if (this._undoStack.length >= (this._options.historySize || 100)) {
      this._undoStack.shift();
    }
    this._undoStack.push(this._getJSON()); // 如果有额外的属性需要保存
  }

  undo() {
    if (this._undoStack.length === 0) return;

    this._redoStack.push(this._getJSON());
    const prevState = this._undoStack.pop();

    this._isProgrammaticChange = true;
    this._canvas.loadFromJSON(prevState, () => {
      this._canvas.renderAll();
      this._isProgrammaticChange = false;
    });
  }

  redo() {
    if (this._redoStack.length === 0) return;

    this._undoStack.push(this._getJSON());
    const nextState = this._redoStack.pop();

    this._isProgrammaticChange = true;
    this._canvas.loadFromJSON(nextState, () => {
      this._canvas.renderAll();
      this._isProgrammaticChange = false;
    });
  }

  /**
   * 获取 json
   * @returns json
   */
  private _getJSON() {
    return this._canvas.toJSON([
      'id',
      'canRemove',
      'name',
      'custom',
      'gradientAngle',
      'selectable',
      'hasControls',
      'visible',
      'evented',
    ])
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
