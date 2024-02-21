import dayjs from 'dayjs'
import { Plugin } from './createPlugin'
import { parseCSSGradient, generateFabricGradientFromColorStops } from '../utils/color'

import type { fabric } from 'fabric'
import type { Editor } from '../core'

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
    target.hasControls = !target.hasControls
    const attrs = [
      'lockMovementX',
      'lockMovementY',
      'lockRotation',
      'lockScalingX',
      'lockScalingY',
    ]
    target.set(attrs.reduce((data, key) => {
      // @ts-expect-error
      data[key] = !target.hasControls
      return data
    }, {}))
    // 更新视图
    this._canvas.requestRenderAll()
    // 通知编辑器更新
    this._noticeEditorUpdate('modify-lock', null, target)
  }

  /**
   * 编辑元素
   */
  editAttr(
    id: string,
    data: any,
    cb?: (target: fabric.Group | fabric.Rect | fabric.IText | fabric.Textbox, context: ThisType<AttrsEditPlugin>) => void,
  ): void {
    const objects = this._canvas.getObjects()
    const target: fabric.Object | fabric.Group | undefined = objects.find((item) => {
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
      // const { width, height, scaleY, scaleX } = target
      updateImgSrc(data.src as string, target as fabric.Image, () => {
        // 不在处理缩放
        // target?.set({
        //   scaleX: (width! * scaleX!) / target.width!,
        //   scaleY: (height! * scaleY!) / target.height!,
        // })
        this._canvas.requestRenderAll()
      })
      return
    }

    // qrcode 组件
    if (target?.isType('group')) {
      if (!target.custom.data) {
        return
      }

      if (target.custom.type === 'qrcode') {
        this._editor.getPluginV2('InsertQRCodePlugin').then((plugin) => {
          // 更新原有数据
          target!.custom!.data!.text = data.text
          plugin?.genQrcodeComp(data.text, target!.custom.data!.options).then((newQrcode: fabric.Group | void) => {
            newQrcode?.set({
              id: target!.id,
              name: target!.name,
              left: target!.left,
              top: target!.top,
              custom: target!.custom,
            })
            this._canvas.remove(target!)
            this._canvas.add(newQrcode!)
            this._canvas.setActiveObject(newQrcode!)
            this._canvas.requestRenderAll()
          })
        })
        return
      }

      if (target.custom.type === 'dateTB') {
        // NOTE: 更新自定义数据
        target!.custom!.data!.value = data.value
        const dateGroupObjects = (target as fabric.Group).getObjects()
        let date = data?.value
        if (!date) {
          const template = 'YYYY-MM-DD'
          date = dayjs(new Date()).format(template)
        }
        const arr = date.split('-')

        dateGroupObjects?.forEach((i: any) => {
          if (i.type == 'textbox' || i.type === 'text') {
            if (i.custom.position == 'top') {
              i.set('text', arr[0])
            }
            else {
              i.set('text', arr[1] + '.' + arr[2])
            }
          }
        })
        this._canvas.requestRenderAll()
      }

      if (target.custom.type === 'avatar') {
        const _icon = target.custom.data.icon
        const _avatar = target.custom.data.avatar
        const { icon, avatar } = data.value

        target!.custom!.data = data.value
        /**
         * 异步调用插件
         */
        this._editor.getPluginV2('ShowUserAvatarsPlugin').then((plugin) => {
          plugin?.genUserAvatarsComp(
            { avatarUrl: avatar || _avatar || '', iconUrl: icon || _icon || '' },
          ).then((newObj: fabric.Group | void) => {
            newObj?.set({
              id: target!.id,
              name: target!.name,
              left: target!.left,
              top: target!.top,
              custom: target!.custom,
            })

            this._canvas.remove(target!)
            this._canvas.add(newObj!)
            this._canvas.setActiveObject(newObj!)
            this._canvas.requestRenderAll()
          })
        })
      }
    }

    if (target?.type === 'rect') {
      const gradientData = parseCSSGradient(data.fill)
      const { type, colors, shapeAndPosition } = gradientData!
      const handlers = colors.map(item => ({
        offset: item.position,
        color: `rgba(${item.color.r}, ${item.color.g}, ${item.color.b}, ${item.color.a})`,
      }))
      const { width, height } = target
      // 对外暴露
      const fillObj = generateFabricGradientFromColorStops(handlers, width!, height!, type, shapeAndPosition!) || ''
      target?.set({ fill: fillObj })
    }

    if (cb) {
      cb(target!, this)
    }
    else {
      // 元素存在更新元素属性
      target?.set(data)
      // 更新画布
      this._canvas.requestRenderAll()
    }
  }

  async mounted() {
    this._editor.emit(`${this.name}:mounted`)
  }
}
