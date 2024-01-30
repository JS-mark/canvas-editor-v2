/*
 * @Author: Mark
 * @Date: 2023-06-15 23:23:18
 * @LastEditors: Mark
 * @LastEditTime: 2024-01-28 22:13:07
 * @Description: 图层调整插件
 */

import type { fabric } from 'fabric'
import type { Editor } from '../core'
import { Plugin } from './createPlugin'

export class LayerPlugin extends Plugin.BasePlugin {
  get name() {
    return 'LayerPlugin'
  }

  get events(): string[] {
    return []
  }

  get hotkeys(): string[] {
    return []
  }

  constructor(canvas: fabric.Canvas, editor: Editor, options: Plugin.Options) {
    super(canvas, editor, options)
  }

  _getWorkspace() {
    return this._canvas.getObjects().find((item) => {
      return item.name === 'workspace' && item.id === 'workspace'
    })
  }

  _workspaceSendToBack() {
    const workspace = this._getWorkspace()
    workspace && workspace.sendToBack()
  }

  up() {
    const actives = this._canvas.getActiveObjects()
    if (actives && actives.length === 1) {
      const activeObject = this._canvas.getActiveObjects()[0]
      activeObject && activeObject.bringForward()
      this._canvas.renderAll()
      this._workspaceSendToBack()
    }
  }

  upTop() {
    const actives = this._canvas.getActiveObjects()
    if (actives && actives.length === 1) {
      const activeObject = this._canvas.getActiveObjects()[0]
      activeObject && activeObject.bringToFront()
      this._canvas.renderAll()
      this._workspaceSendToBack()
    }
  }

  down() {
    const actives = this._canvas.getActiveObjects()
    if (actives && actives.length === 1) {
      const activeObject = this._canvas.getActiveObjects()[0]
      activeObject && activeObject.sendBackwards()
      this._canvas.renderAll()
      this._workspaceSendToBack()
    }
  }

  downTop() {
    const actives = this._canvas.getActiveObjects()
    if (actives && actives.length === 1) {
      const activeObject = this._canvas.getActiveObjects()[0]
      activeObject && activeObject.sendToBack()
      this._canvas.renderAll()
      this._workspaceSendToBack()
    }
  }
}
