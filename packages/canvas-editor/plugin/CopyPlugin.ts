/*
 * @Author: Mark
 * @Date: 2023-06-20 12:38:37
 * @LastEditors: Mark
 * @LastEditTime: 2024-01-29 23:22:36
 * @Description: 复制插件
 */

import { Plugin } from './createPlugin'
import { clipboardText } from '../utils/utils'

import type { fabric } from 'fabric'
import type { Editor } from '../core'

export class CopyPlugin extends Plugin.BasePlugin {
  get name() {
    return 'CopyPlugin'
  }

  get events() {
    return []
  }

  get hotkeys() {
    return ['ctrl+v', 'ctrl+c']
  }

  private cache: null | fabric.ActiveSelection | fabric.Object
  constructor(canvas: fabric.Canvas, editor: Editor, options: Plugin.Options) {
    super(canvas, editor, options)
    this.cache = null
  }

  // 多选对象复制
  _copyActiveSelection(activeObject: fabric.Object) {
    // 间距设置
    const grid = 10
    activeObject?.clone((cloned: fabric.Object) => {
      // 再次进行克隆，处理选择多个对象的情况
      cloned.clone((clonedObj: fabric.ActiveSelection) => {
        this._canvas.discardActiveObject()
        if (clonedObj.left === undefined || clonedObj.top === undefined)
          return
        // 将克隆的画布重新赋值
        clonedObj.canvas = this._canvas
        // 设置位置信息
        clonedObj.set({
          left: clonedObj.left + grid,
          top: clonedObj.top + grid,
          evented: true,
          name: this.genUid(),
        })
        clonedObj.forEachObject((obj: fabric.Object) => {
          // 组件 id
          obj.id = this.genUid()
          obj.name = this.genName()
          this._canvas.add(obj)
        })
        // 解决不可选择问题
        clonedObj.setCoords()
        this._canvas.setActiveObject(clonedObj)
        this._canvas.requestRenderAll()
      })
    })
  }

  // 单个对象复制
  _copyObject(activeObject: fabric.Object) {
    // 间距设置
    const grid = 10
    activeObject?.clone((cloned: fabric.Object) => {
      if (cloned.left === undefined || cloned.top === undefined)
        return
      this._canvas.discardActiveObject()
      // 设置位置信息
      cloned.set({
        left: cloned.left + grid,
        top: cloned.top + grid,
        evented: true,
        name: this.genUid(),
      })
      this._canvas.add(cloned)
      this._canvas.setActiveObject(cloned)
      this._canvas.requestRenderAll()
    })
  }

  // 复制元素
  clone(paramsActiveObject?: fabric.ActiveSelection | fabric.Object) {
    const activeObject = paramsActiveObject || this._canvas.getActiveObject()
    if (!activeObject)
      return
    if (activeObject?.type === 'activeSelection') {
      this._copyActiveSelection(activeObject)
    }
    else {
      this._copyObject(activeObject)
    }
  }

  // 快捷键扩展回调
  hotkeyEvent(eventName: string, e: KeyboardEvent) {
    if (eventName === 'ctrl+c' && e.type === 'keydown') {
      const activeObject = this._canvas.getActiveObject()
      this.cache = activeObject
    }
    if (eventName === 'ctrl+v' && e.type === 'keydown') {
      if (this.cache) {
        this.clone(this.cache)
      }
    }
  }

  /**
   * 复制文本
   * @param obj
   * @param val
   */
  copyText(obj?: fabric.Object, val: string = '') {
    const curTarget = obj || this._canvas.getActiveObject()
    return clipboardText(val || curTarget?.name || curTarget?.id || '')
  }
}