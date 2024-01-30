/*
 * @Author: Mark
 * @Date: 2023-06-21 22:09:36
 * @LastEditors: Mark
 * @LastEditTime: 2024-01-30 14:01:22
 * @Description: file content
 */

import { fabric } from 'fabric'
import type { Editor } from '../core'
import { Plugin } from './createPlugin'
import '../core/objects/Arrow'

export class DrawLinePlugin extends Plugin.BasePlugin {
  get name() {
    return 'DrawLinePlugin'
  }

  get events() {
    return []
  }

  get hotkeys() {
    return []
  }

  isDrawingLineMode: boolean
  isArrow: boolean
  lineToDraw: any
  pointer: any
  pointerPoints: any
  isDrawingLine: boolean
  constructor(canvas: fabric.Canvas, editor: Editor, options: Plugin.Options) {
    super(canvas, editor, options)

    this.isDrawingLine = false
    this.isDrawingLineMode = false
    this.isArrow = false
    this.lineToDraw = null
    this.pointer = null
    this.pointerPoints = null
    this.init()
  }

  init() {
    this._canvas.on('mouse:down', (o) => {
      if (!this.isDrawingLineMode)
        return
      this._canvas.discardActiveObject()
      this._canvas.getObjects().forEach((obj) => {
        obj.selectable = false
        obj.hasControls = false
      })
      this._canvas.requestRenderAll()
      this.isDrawingLine = true
      this.pointer = this._canvas.getPointer(o.e)
      this.pointerPoints = [this.pointer.x, this.pointer.y, this.pointer.x, this.pointer.y]

      // @ts-expect-error
      const NodeHandler = this.isArrow ? fabric.Arrow : fabric.Line
      this.lineToDraw = new NodeHandler(this.pointerPoints, {
        strokeWidth: 2,
        stroke: '#000000',
        name: this.genUid(),
      })

      this.lineToDraw.selectable = false
      this.lineToDraw.evented = false
      this.lineToDraw.strokeUniform = true
      this._canvas.add(this.lineToDraw)
    })

    this._canvas.on('mouse:move', (o) => {
      if (!this.isDrawingLine)
        return
      this._canvas.discardActiveObject()
      const activeObject = this._canvas.getActiveObject()
      if (activeObject)
        return
      this.pointer = this._canvas.getPointer(o.e)

      if (o.e.shiftKey) {
        // calc angle
        const startX = this.pointerPoints[0]
        const startY = this.pointerPoints[1]
        const x2 = this.pointer.x - startX
        const y2 = this.pointer.y - startY
        const r = Math.sqrt(x2 * x2 + y2 * y2)
        let angle = (Math.atan2(y2, x2) / Math.PI) * 180
        // @ts-expect-error
        angle = parseInt(((angle + 7.5) % 360) / 15) * 15

        const cosx = r * Math.cos((angle * Math.PI) / 180)
        const sinx = r * Math.sin((angle * Math.PI) / 180)

        this.lineToDraw.set({
          x2: cosx + startX,
          y2: sinx + startY,
        })
      }
      else {
        this.lineToDraw.set({
          x2: this.pointer.x,
          y2: this.pointer.y,
        })
      }

      this._canvas.renderAll()
    })

    this._canvas.on('mouse:up', () => {
      if (!this.isDrawingLine)
        return
      this.lineToDraw.setCoords()
      this.isDrawingLine = false
      this._canvas.discardActiveObject()
    })
  }

  setArrow(params: any) {
    this.isArrow = params
  }

  setMode(params: any) {
    this.isDrawingLineMode = params
    if (!this.isDrawingLineMode) {
      this.endRest()
    }
  }

  endRest() {
    this._canvas.getObjects().forEach((obj) => {
      if (obj.id !== 'workspace' && obj.name !== 'workspace') {
        obj.selectable = true
        obj.hasControls = true
      }
    })
  }
}
