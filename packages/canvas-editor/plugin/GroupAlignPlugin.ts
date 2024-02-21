/*
 * @Author: Mark
 * @Date: 2023-06-22 16:19:46
 * @LastEditors: Mark
 * @LastEditTime: 2024-01-31 10:48:14
 * @Description: 组对齐插件
 */

import { fabric } from 'fabric'
import type { Editor } from '../core'
import { Plugin } from './createPlugin'

export class GroupAlignPlugin extends Plugin.BasePlugin {
  get name() {
    return 'GroupAlignPlugin'
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

  left() {
    const activeObject = this._canvas.getActiveObject()
    const selectObjects = this._canvas.getActiveObjects()
    const { left } = activeObject!
    this._canvas.discardActiveObject()
    selectObjects.forEach((item) => {
      const bounding = item.getBoundingRect(true)
      item.set({
        left: left! - bounding.left + item.left!,
      })
      item.setCoords()
    })
    const activeSelection = new fabric.ActiveSelection(selectObjects, {
      canvas: this._canvas,
    })
    this._canvas.setActiveObject(activeSelection)
    this._canvas.requestRenderAll()
  }

  right() {
    const activeObject = this._canvas.getActiveObject()
    const selectObjects = this._canvas.getActiveObjects()
    const { left, width } = activeObject!
    this._canvas.discardActiveObject()
    selectObjects.forEach((item) => {
      const bounding = item.getBoundingRect(true)
      item.set({
        left: left! + width! - (bounding.left + bounding.width) + item.left!,
      })
    })
    const activeSelection = new fabric.ActiveSelection(selectObjects, {
      canvas: this._canvas,
    })
    this._canvas.setActiveObject(activeSelection)
    this._canvas.requestRenderAll()
  }

  xcenter() {
    const activeObject = this._canvas.getActiveObject()
    const selectObjects = this._canvas.getActiveObjects()
    const { left, width } = activeObject!
    this._canvas.discardActiveObject()
    selectObjects.forEach((item) => {
      const bounding = item.getBoundingRect(true)
      item.set({
        left: left! + width! / 2 - (bounding.left + bounding.width / 2) + item.left!,
      })
    })
    const activeSelection = new fabric.ActiveSelection(selectObjects, {
      canvas: this._canvas,
    })
    this._canvas.setActiveObject(activeSelection)
    this._canvas.requestRenderAll()
  }

  ycenter() {
    const activeObject = this._canvas.getActiveObject()
    const selectObjects = this._canvas.getActiveObjects()
    const { top, height } = activeObject!
    this._canvas.discardActiveObject()
    selectObjects.forEach((item) => {
      const bounding = item.getBoundingRect(true)
      item.set({
        top: top! + height! / 2 - (bounding.top + bounding.height / 2) + item.top!,
      })
    })
    const activeSelection = new fabric.ActiveSelection(selectObjects, {
      canvas: this._canvas,
    })
    this._canvas.setActiveObject(activeSelection)
    this._canvas.requestRenderAll()
  }

  top() {
    const activeObject = this._canvas.getActiveObject()
    const selectObjects = this._canvas.getActiveObjects()
    const { top } = activeObject!
    this._canvas.discardActiveObject()
    selectObjects.forEach((item) => {
      const bounding = item.getBoundingRect(true)
      item.set({
        top: top! - bounding.top + item.top!,
      })
    })
    const activeSelection = new fabric.ActiveSelection(selectObjects, {
      canvas: this._canvas,
    })
    this._canvas.setActiveObject(activeSelection)
    this._canvas.requestRenderAll()
  }

  bottom() {
    const activeObject = this._canvas.getActiveObject()
    const selectObjects = this._canvas.getActiveObjects()
    const { top, height } = activeObject!
    this._canvas.discardActiveObject()
    selectObjects.forEach((item) => {
      const bounding = item.getBoundingRect(true)
      item.set({
        top: top! + height! - (bounding.top + bounding.height) + item.top!,
      })
    })
    const activeSelection = new fabric.ActiveSelection(selectObjects, {
      canvas: this._canvas,
    })
    this._canvas.setActiveObject(activeSelection)
    this._canvas.requestRenderAll()
  }

  xequation() {
    const activeObject = this._canvas.getActiveObject()

    // width属性不准确，需要坐标换算
    function getItemWidth(item: any) {
      return item.aCoords.tr.x - item.aCoords.tl.x
    }

    // 获取所有元素高度
    function getAllItemHeight() {
      let count = 0
       // @ts-expect-error
      activeObject!.forEachObject((item) => {
        count += getItemWidth(item)
      })
      return count
    }
    // 获取平均间距
    function spacWidth() {
      const count = getAllItemHeight()
      const allSpac = activeObject!.width! - count
      // @ts-expect-error
      return allSpac / (activeObject!._objects!.length - 1)
    }

    // 获取当前元素之前所有元素的高度
    function getItemLeft(i: number) {
      if (i === 0)
        return 0
      let width = 0
      for (let index = 0; index < i; index++) {
         // @ts-expect-error
        width += getItemWidth(activeObject._objects[index])
      }
      return width
    }

    if (activeObject && activeObject.type === 'activeSelection') {
      const activeSelection = activeObject
      // 排序
       // @ts-expect-error
      activeSelection._objects.sort((a, b) => a.left - b.left)

      // 平均间距计算
      const itemSpac = spacWidth()
      // 组原点高度
       // @ts-expect-error
      const yHeight = activeObject.width / 2
       // @ts-expect-error
      activeObject.forEachObject((item, i) => {
        // 获取当前元素之前所有元素的高度
        const preHeight = getItemLeft(i)
        // 顶部距离 间距 * 索引 + 之前元素高度 - 原点高度
        const top = itemSpac * i + preHeight - yHeight
        item.set('left', top)
      })
      this._canvas.renderAll()
    }
  }

  yequation() {
    const activeObject = this._canvas.getActiveObject()
    // width属性不准确，需要坐标换算
    function getItemHeight(item: any) {
      return item.aCoords.bl.y - item.aCoords.tl.y
    }
    // 获取所有元素高度
    function getAllItemHeight() {
      let count = 0
       // @ts-expect-error
      activeObject.forEachObject((item) => {
        count += getItemHeight(item)
      })
      return count
    }
    // 获取平均间距
    function spacHeight() {
      const count = getAllItemHeight()
       // @ts-expect-error
      const allSpac = activeObject.height - count
       // @ts-expect-error
      return allSpac / (activeObject._objects.length - 1)
    }

    // 获取当前元素之前所有元素的高度
    function getItemTop(i: number) {
      if (i === 0)
        return 0
      let height = 0
      for (let index = 0; index < i; index++) {
         // @ts-expect-error
        height += getItemHeight(activeObject._objects[index])
      }
      return height
    }

    if (activeObject && activeObject.type === 'activeSelection') {
      const activeSelection = activeObject
      // 排序
       // @ts-expect-error
      activeSelection._objects.sort((a, b) => a.top - b.top)

      // 平均间距计算
      const itemSpac = spacHeight()
      // 组原点高度
       // @ts-expect-error
      const yHeight = activeObject.height / 2
       // @ts-expect-error
      activeObject.forEachObject((item, i) => {
        // 获取当前元素之前所有元素的高度
        const preHeight = getItemTop(i)
        // 顶部距离 间距 * 索引 + 之前元素高度 - 原点高度
        const top = itemSpac * i + preHeight - yHeight
        item.set('top', top)
      })
      this._canvas.renderAll()
    }
  }
}
