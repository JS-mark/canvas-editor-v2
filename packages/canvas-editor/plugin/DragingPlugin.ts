/*
 * @Author: Mark
 * @Date: 2023-05-19 08:31:34
 * @LastEditors: Mark
 * @LastEditTime: 2024-01-30 13:52:08
 * @Description: 拖拽插件
 */

import type { Editor } from '../core'
import { Plugin } from './createPlugin'

declare type ExtCanvas = fabric.Canvas & {
  isDragging: boolean
  lastPosX: number
  lastPosY: number
}

export class DragingPlugin extends Plugin.BasePlugin {
  get name() {
    return 'DragingPlugin'
  }

  get events() {
    return ['startDraging', 'endDraging']
  }

  get hotkeys() {
    return ['space']
  }

  public defaultOption = {}
  dragMode = false

  constructor(canvas: fabric.Canvas, editor: Editor, options: Plugin.Options) {
    super(canvas, editor, options)
    this.dragMode = false
    this.init()
  }

  init() {
    this._initDraging()
  }

  startDraging() {
    this.dragMode = true
    this._canvas.defaultCursor = 'grab'
    this._editor.emit('startDraging')
    this._canvas.renderAll()
  }

  endDraging() {
    this.dragMode = false
    this._canvas.defaultCursor = 'default'
    // @ts-expect-error
    this._canvas.isDragging = false
    this._editor.emit('endDraging')
    this._canvas.renderAll()
  }

  // 拖拽模式;
  _initDraging() {
    // eslint-disable-next-line ts/no-this-alias
    const This = this
    this._canvas.on('mouse:down', function (this: ExtCanvas, opt) {
      const evt = opt.e
      if (evt.altKey || This.dragMode) {
        This._canvas.defaultCursor = 'grabbing'
        This._canvas.discardActiveObject()
        This._setDraging()
        this.selection = false
        this.isDragging = true
        this.lastPosX = evt.clientX
        this.lastPosY = evt.clientY
        this.requestRenderAll()
      }
    })

    this._canvas.on('mouse:move', function (this: ExtCanvas, opt) {
      if (this.isDragging) {
        This._canvas.discardActiveObject()
        This._canvas.defaultCursor = 'grabbing'
        const { e } = opt
        if (!this.viewportTransform)
          return
        const vpt = this.viewportTransform
        vpt[4] += e.clientX - this.lastPosX
        vpt[5] += e.clientY - this.lastPosY
        this.lastPosX = e.clientX
        this.lastPosY = e.clientY
        this.requestRenderAll()
      }
    })

    this._canvas.on('mouse:up', function (this: ExtCanvas) {
      if (!this.viewportTransform)
        return
      this.setViewportTransform(this.viewportTransform)
      this.isDragging = false
      this.selection = true
      this.getObjects().forEach((obj) => {
        // 除了workspace其他均可以选中
        if (obj.id !== 'workspace' && obj.name !== 'workspace' && obj.hasControls) {
          obj.selectable = true
        }
        else {
          obj.hoverCursor = 'default'
          obj.moveCursor = 'default'
        }
      })
      This._canvas.defaultCursor = 'default'
      this.requestRenderAll()
    })
  }

  _setDraging() {
    this._canvas.selection = false
    this._canvas.defaultCursor = 'grab'
    this._canvas.getObjects().forEach((obj) => {
      obj.selectable = false
    })
    this._canvas.requestRenderAll()
  }

  // 快捷键扩展回调
  hotkeyEvent(_: string, e: KeyboardEvent) {
    if (e.code === 'Space' && e.type === 'keydown') {
      if (!this.dragMode) {
        this.startDraging()
      }
    }
    if (e.code === 'Space' && e.type === 'keyup') {
      this.endDraging()
    }
  }
}
