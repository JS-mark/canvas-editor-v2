/*
 * @Author: Mark
 * @Date: 2023-06-20 12:57:35
 * @LastEditors: Mark
 * @LastEditTime: 2024-01-28 15:46:19
 * @Description: 删除快捷键
 */

import { Plugin } from './createPlugin'
import type { fabric } from 'fabric'
import type { Editor } from '../core'

export class DeleteHotKeyPlugin extends Plugin.BasePlugin {
  get name() {
    return 'DeleteHotKeyPlugin'
  }

  get hotkeys() {
    return ['backspace']
  }

  get events(): string[] {
    return []
  }

  constructor(canvas: fabric.Canvas, editor: Editor, options: Plugin.Options) {
    super(canvas, editor, options)
  }

  // 快捷键扩展回调
  hotkeyEvent(eventName: string, e: KeyboardEvent) {
    if (e.type === 'keydown' && eventName === 'backspace') {
      this.del()
    }
  }

  del() {
    const activeObject = this._canvas.getActiveObjects()
    if (activeObject) {
      activeObject.map((item) => {
        this._canvas.remove(item)
      })
      this._canvas.requestRenderAll()
      this._canvas.discardActiveObject()
    }
  }
}
