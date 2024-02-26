/*
 * @Author: Mark
 * @Date: 2023-06-20 13:21:10
 * @LastEditors: Mark
 * @LastEditTime: 2024-02-22 20:50:21
 * @Description: 组合拆分组合插件
 */

import { Plugin } from './createPlugin'
import type { fabric } from 'fabric'
import type { Editor } from '../core'

export class GroupPlugin extends Plugin.BasePlugin {
  get name() {
    return 'GroupPlugin'
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

  // 拆分组
  unGroup() {
    const activeObject = this._canvas.getActiveObject() as fabric.Group
    if (!activeObject)
      return
    // 先获取当前选中的对象，然后打散
    activeObject.toActiveSelection()
    activeObject.getObjects().forEach((item: fabric.Object) => {
      item.set('name', this.genUid())
    })
    this._canvas.discardActiveObject().renderAll()
  }

  // 组合元素
  group() {
    const activeObj = this._canvas.getActiveObject() as fabric.ActiveSelection
    if (!activeObj)
      return
    const activegroup = activeObj.toGroup()
    const objectsInGroup = activegroup.getObjects()
    activegroup.clone((newgroup: fabric.Group) => {
      newgroup.set('name', this.genUid())
      // 设置定义属性
      newgroup.set('custom', {
        type: 'workspace',
      })
      this._canvas.remove(activegroup)
      objectsInGroup.forEach((object) => {
        this._canvas.remove(object)
      })
      this._canvas.add(newgroup)
      this._canvas.setActiveObject(newgroup)
    })
  }

  async mounted() {
    this._editor.emit(`${this.name}:mounted`)
  }
}
