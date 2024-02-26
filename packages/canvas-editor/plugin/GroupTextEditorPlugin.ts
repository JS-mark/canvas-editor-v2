/*
 * @Author: Mark
 * @Date: 2023-06-22 16:11:40
 * @LastEditors: Mark
 * @LastEditTime: 2024-02-22 20:50:27
 * @Description: 组内文字编辑
 */

import { fabric } from 'fabric'
import type { Editor } from '../core'
import { Plugin } from './createPlugin'

export class GroupTextEditorPlugin extends Plugin.BasePlugin {
  get name() {
    return 'GroupTextEditorPlugin'
  }

  get events(): string[] {
    return []
  }

  get hotkeys(): string[] {
    return []
  }

  isDown = false
  constructor(canvas: fabric.Canvas, editor: Editor, options: Plugin.Options) {
    super(canvas, editor, options)

    this._init()
  }

  // 组内文本输入
  _init() {
    this._canvas.on('mouse:down', (opt) => {
      this.isDown = true
      // 重置选中controls
      if (
        opt.target
        && !opt.target.lockMovementX
        && !opt.target.lockMovementY
        && !opt.target.lockRotation
        && !opt.target.lockScalingX
        && !opt.target.lockScalingY
      ) {
        opt.target.hasControls = true
      }
    })

    this._canvas.on('mouse:up', () => {
      this.isDown = false
    })

    this._canvas.on('mouse:dblclick', (opt) => {
      if (opt.target && opt.target.type === 'group') {
        const selectedObject = this._getGroupObj(opt) as fabric.IText
        if (!selectedObject)
          return
        selectedObject.selectable = true
        // 由于组内的元素，双击以后会导致controls偏移，因此隐藏他
        if (selectedObject.hasControls) {
          selectedObject.hasControls = false
        }
        if (this.isText(selectedObject)) {
          this._bedingTextEditingEvent(selectedObject, opt)
          return
        }
        this._canvas.setActiveObject(selectedObject)
        this._canvas.renderAll()
      }
    })
  }

  // 获取点击区域内的组内文字元素
  _getGroupTextObj(opt: fabric.IEvent<MouseEvent>) {
    const pointer = this._canvas.getPointer(opt.e, true)
    // @ts-expect-error
    const clickObj = this._canvas._searchPossibleTargets(opt.target?._objects, pointer)
    if (clickObj && this.isText(clickObj)) {
      return clickObj
    }
    return false
  }

  _getGroupObj(opt: fabric.IEvent<MouseEvent>) {
    const pointer = this._canvas.getPointer(opt.e, true)
    // @ts-expect-error
    const clickObj = this._canvas._searchPossibleTargets(opt.target?._objects, pointer)
    return clickObj
  }

  // 通过组合重新组装来编辑文字，可能会耗性能。
  _bedingTextEditingEvent(textObject: fabric.IText, opt: fabric.IEvent<MouseEvent>) {
    if (!opt.target)
      return
    const textObjectJSON = textObject.toObject()
    const groupObj = opt.target

    const ftype: any = {
      'i-text': 'IText',
      'text': 'Text',
      'textbox': 'Textbox',
    }

    const eltype: string = ftype[textObjectJSON.type]

    const groupMatrix: number[] = groupObj.calcTransformMatrix()

    const a: number = groupMatrix[0]
    const b: number = groupMatrix[1]
    const c: number = groupMatrix[2]
    const d: number = groupMatrix[3]
    const e: number = groupMatrix[4]
    const f: number = groupMatrix[5]
    // @ts-expect-error
    const newX = a * textObject.left + c * textObject.top + e
    // @ts-expect-error
    const newY = b * textObject.left + d * textObject.top + f

    // @ts-expect-error
    const tempText = new fabric[eltype](textObject.text, {
      ...textObjectJSON,
      textAlign: textObject.textAlign,
      left: newX,
      top: newY,
      styles: textObject.styles,
      groupCopyed: textObject.group,
    })
    tempText.id = this.genUid()
    tempText.name = this.genName()
    textObject.visible = false
    // @ts-expect-error
    opt.target.addWithUpdate()
    tempText.visible = true
    tempText.selectable = true
    tempText.hasControls = false
    tempText.editable = true
    this._canvas.add(tempText)
    this._canvas.setActiveObject(tempText)
    tempText.enterEditing()
    tempText.selectAll()

    tempText.on('editing:exited', () => {
      // 进入编辑模式时触发
      textObject.set({
        text: tempText.text,
        visible: true,
      })
      // @ts-expect-error
      opt.target?.addWithUpdate()
      tempText.visible = false
      this._canvas.remove(tempText)
      this._canvas.setActiveObject(opt.target!)
    })
  }

  // 绑定编辑取消事件
  _bedingEditingEvent(textObject: fabric.IText, opt: fabric.IEvent<MouseEvent>) {
    if (!opt.target)
      return
    const left = opt.target.left
    const top = opt.target.top
    const ids = this._unGroup() || []

    const resetGroup = () => {
      const groupArr = this._canvas.getObjects().filter(item => item.id && ids.includes(item.id))
      // 删除元素
      groupArr.forEach(item => this._canvas.remove(item))

      // 生成新组
      const group = new fabric.Group([...groupArr])
      group.set('left', left)
      group.set('top', top)
      group.set('id', this.genUid())
      group.set('name', this.genName())
      textObject.off('editing:exited', resetGroup)
      this._canvas.add(group)
      this._canvas.discardActiveObject().renderAll()
    }
    // 绑定取消事件
    textObject.on('editing:exited', resetGroup)
  }

  // 拆分组合并返回ID
  _unGroup() {
    const ids: string[] = []
    const activeObj = this._canvas.getActiveObject() as fabric.Group
    if (!activeObj)
      return
    activeObj.getObjects().forEach((item) => {
      const id = this.genUid()
      ids.push(id)
      item.set('id', id)
      item.set('name', id)
      // 设置自定义属性

      item.set('custom', {
        type: item.type!,
        schemes: [],
      })
    })
    activeObj.toActiveSelection()
    return ids
  }

  isText(obj: fabric.Object) {
    return obj.type && ['i-text', 'text', 'textbox'].includes(obj.type)
  }

  async mounted() {
    this._editor.emit(`${this.name}:mounted`)
  }
}
