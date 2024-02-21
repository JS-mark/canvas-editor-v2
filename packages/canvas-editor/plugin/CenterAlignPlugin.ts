/*
 * @Author: Mark
 * @Date: 2023-06-15 22:49:42
 * @LastEditors: Mark
 * @LastEditTime: 2024-02-03 22:32:53
 * @Description: 居中对齐插件
 */

import { fabric } from 'fabric'
import { Plugin } from './createPlugin'
import type { Editor } from '../core'

export class CenterAlignPlugin extends Plugin.BasePlugin {
  get name() {
    return 'CenterAlignPlugin'
  }

  get hotkeys() {
    return ['space']
  }

  get events(): string[] {
    return []
  }

  constructor(canvas: fabric.Canvas, editor: Editor, options: Plugin.Options) {
    super(canvas, editor, options)
  }

  center(workspace: fabric.Rect, object: fabric.Object) {
    const center = workspace.getCenterPoint()
    return this._canvas._centerObject(object, center)
  }

  centerV(workspace: fabric.Rect, object: fabric.Object) {
    return this._canvas._centerObject(
      object,
      new fabric.Point(object.getCenterPoint().x, workspace.getCenterPoint().y),
    )
  }

  centerH(workspace: fabric.Rect, object: fabric.Object) {
    return this._canvas._centerObject(
      object,
      new fabric.Point(workspace.getCenterPoint().x, object.getCenterPoint().y),
    )
  }

  position(name: 'centerH' | 'center' | 'centerV') {
    const anignType = ['centerH', 'center', 'centerV']
    const activeObject = this._canvas.getActiveObject()
    if (anignType.includes(name) && activeObject) {
      const defaultWorkspace = this._canvas.getObjects().find((item) => {
        return item.id === 'workspace' && item.name === 'workspace'
      })
      if (defaultWorkspace) {
        this[name](defaultWorkspace, activeObject)
      }
      this._canvas.renderAll()
    }
  }
}
