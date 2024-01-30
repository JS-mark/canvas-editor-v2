/*
 * @Author: Mark
 * @Date: 2023-06-20 12:52:09
 * @LastEditors: Mark
 * @LastEditTime: 2024-01-24 13:07:12
 * @Description: 移动快捷键
 */

import type { fabric } from 'fabric'
import type { Editor } from '../core'
import { Plugin } from './createPlugin'

export class MoveHotKeyPlugin extends Plugin.BasePlugin {
  get name() {
    return 'MoveHotKeyPlugin'
  }

  get hotkeys() {
    return ['left', 'right', 'down', 'up']
  }

  get events(): string[] {
    return []
  }

  constructor(canvas: fabric.Canvas, editor: Editor, options: Plugin.Options) {
    super(canvas, editor, options)
  }

  // 快捷键扩展回调
  hotkeyEvent(eventName: string, e: KeyboardEvent) {
    if (e.type === 'keydown') {
      const activeObject = this._canvas.getActiveObject()
      if (!activeObject)
        return
      switch (eventName) {
        case 'left':
          if (activeObject.left === undefined)
            return
          activeObject.set('left', activeObject.left - 1)
          break
        case 'right':
          if (activeObject.left === undefined)
            return
          activeObject.set('left', activeObject.left + 1)
          break
        case 'down':
          if (activeObject.top === undefined)
            return
          activeObject.set('top', activeObject.top + 1)
          break
        case 'up':
          if (activeObject.top === undefined)
            return
          activeObject.set('top', activeObject.top - 1)
          break
        default:
      }
      this._canvas.renderAll()
    }
  }
}
