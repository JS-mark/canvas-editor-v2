import { Plugin } from './createPlugin'
import { objectOmit } from '@vueuse/shared'
import type { Editor } from '../core'
import type fabric from 'fabric/fabric-impl'

/**
 * 仅支持单个元素编辑
 * 需设置canvas 不能全选元素
 */
export class AttrsEditPlugin extends Plugin.BasePlugin {
  protected get name() {
    return 'AttrsEditPlugin'
  }

  protected get hotkeys() {
    return []
  }

  protected get events(): string[] {
    return ['on-object-change', 'on-object-modify', 'on-obejct-selected', 'on-obejct-text-changed']
  }

  get _canEditAttrs(): (keyof fabric.Object)[] {
    return ['left', 'top']
  }

  constructor(canvas: fabric.Canvas, editor: Editor, options: Plugin.Options) {
    super(canvas, editor, options)
    // init
    this.init()
  }

  init() {
    this._bindEvent()
  }

  /**
   * 获取选中元素
   * @returns fabric.Object
   */
  private _getCurTarget() {
    return this._canvas.getActiveObject()
  }

  /**
   * 过滤可以编辑的属性
   * @param obj
   * @returns fabric.Object
   */
  filterCanEditAttrs(obj: fabric.Object) {
    return objectOmit(obj, this._canEditAttrs)
  }

  private _onObjectModify(event: fabric.IEvent<Event>) {
    // 通过编辑器事件监听通知元素更新
    this._noticeEditorUpdate('editor', event, event.target)
  }

  /**
   * 通知编辑器更新
   * @param type
   * @param event
   * @param target
   */
  private _noticeEditorUpdate(type: 'form' | 'editor' | string, event: fabric.IEvent<Event> | null, target: fabric.Object | undefined) {
    this._editor.emit('on-object-modify', { type, event, target })
  }

  private _onObjectSelected(options: { type: 'created' | 'updated' | 'cleared', event: fabric.IEvent<Event>, target: fabric.Object | null, deselected?: fabric.Object[] | undefined }) {
    // 编辑器 emit
    this._editor.emit('on-obejct-selected', options)
  }

  /**
   * 选区创建
   * @param event
   */
  private _onSelectionCreated(event: fabric.IEvent<Event>) {
    const { selected } = event!
    if (selected) {
      // 触发数据
      this._onObjectSelected({ type: 'created', event, target: this._getCurTarget(), deselected: undefined })
    }
  }

  /**
   * 选区更新
   * @param event
   */
  private _onSelectionUpdated(event: fabric.IEvent<Event>) {
    const { selected, deselected } = event!

    if (selected && selected.length > 0) {
      // 触发数据
      this._onObjectSelected({ type: 'updated', event, target: this._getCurTarget(), deselected })
    }

    if (deselected && selected && selected?.length <= 0) {
      // 触发数据
      this._onObjectSelected({ type: 'cleared', event, target: this._getCurTarget(), deselected })
    }
  }

  /**
   * 选区清除
   * @param event
   */
  private _onSelectionCleared(event: fabric.IEvent<Event>) {
    const { deselected } = event!
    if (deselected && deselected.length > 0) {
      // 触发数据
      this._onObjectSelected({ type: 'cleared', event, target: null, deselected })
    }
  }

  /**
   * 文本组件实时更新事件
   * @param event
   */
  private _onObjectTextChange(event: fabric.IEvent<Event>) {
    this._editor.emit('on-obejct-text-changed', 'editor', event.target)
  }

  /**
   * 绑定事件
   */
  private _bindEvent() {
    // 文本类组件同步修改
    this._canvas.on('text:changed', this._onObjectTextChange.bind(this))
    this._canvas.on('object:modified', this._onObjectModify.bind(this))
    this._canvas.on('selection:created', this._onSelectionCreated.bind(this))
    this._canvas.on('selection:updated', this._onSelectionUpdated.bind(this))
    this._canvas.on('selection:cleared', this._onSelectionCleared.bind(this))
  }

  /**
   * 解绑事件
   */
  private _unbindEvent() {
    this._canvas.off('object:modified', this._onObjectModify.bind(this))
    this._canvas.off('selection:created', this._onSelectionCreated.bind(this))
    this._canvas.off('selection:updated', this._onSelectionUpdated.bind(this))
    this._canvas.off('selection:cleared', this._onSelectionCleared.bind(this))
  }

  /**
   * 卸载事件
   */
  async destroyed() {
    this._unbindEvent()
  }

  /**
   * 显示隐藏
   * @param obj
   */
  setVisible(obj?: fabric.Object) {
    const target = obj || this._getCurTarget()
    if (!target) {
      throw new Error('元素不存在，无法更新！')
    }

    target.visible = !target?.visible

    // 更新视图
    this._canvas.renderAndReset()
    // 通知编辑器更新
    this._noticeEditorUpdate('', null, target)
  }

  /**
   * 设置锁定状态
   * @param obj
   */
  setLock(obj?: fabric.Object) {
    const target = obj || this._getCurTarget()
    if (!target) {
      throw new Error('元素不存在，无法更新！')
    }
    target.evented = !target.evented
    target.hasControls = target.evented
    target.selectable = target.evented
    // 更新视图
    this._canvas.renderAndReset()
    // 通知编辑器更新
    this._noticeEditorUpdate('', null, target)
  }

  /**
   * 编辑元素
   */
  editAttr(id: string, data: any): void {
    let target: fabric.Object | undefined
    const objects = this._canvas.getObjects()
    target = objects.find((item) => {
      // 自定义元素 id
      return item.id === id
    })

    /**
     * 更新 img src
     * @param url
     */
    const updateImgSrc = (url: string, obj: fabric.Image, cb: () => void) => {
      obj.setSrc(url, cb, {
        crossOrigin: 'anonymous',
      })
    }

    // 更新 image 组件 src
    if (target?.isType('image')) {
      const { width, height, scaleY, scaleX } = target
      updateImgSrc(data.src as string, target as fabric.Image, () => {
        target?.set({
          scaleX: (width! * scaleX!) / target.width!,
          scaleY: (height! * scaleY!) / target.height!,
        })
        this._canvas.requestRenderAll()
      })
      return
    }
    // qrcode 组件
    if (target?.isType('group')) {
      if (target.custom.schemes) {
        for (const item of target.custom.schemes) {
          if (item.type === 'qrcode') {
            const plugin = this._editor.getPlugin('InsertQRCodePlugin')
            plugin?.genQrcodeComp(data.text, item.options.options).then((newQrcode) => {
              newQrcode?.set({
                id: target!.id,
                name: target!.name,
                left: target!.left,
                top: target!.top,
                scaleX: target!.scaleX,
                scaleY: target!.scaleY,
                custom: target!.custom,
              })
              this._canvas.remove(target!)
              this._canvas.add(newQrcode!)
              this._canvas.requestRenderAll()
            })
            break
          }
        }
        return
      }
    }

    // 元素存在更新元素属性
    target?.set(data)

    // 更新画布
    this._canvas.requestRenderAll()
  }
}
