/*
 * @Author: Mark
 * @Date: 2023-06-27 12:26:41
 * @LastEditors: Mark
 * @LastEditTime: 2024-02-04 11:38:54
 * @Description: 画布区域插件
 */

import { fabric } from 'fabric'
import type { Editor } from '../core'
import { throttle } from 'lodash-es'
import { Plugin } from './createPlugin'

export class WorkspacePlugin extends Plugin.BasePlugin {
  get name() {
    return 'WorkspacePlugin'
  }

  get hotkeys() {
    return []
  }

  get events() {
    return ['sizeChange']
  }

  private workspaceEl: HTMLElement | undefined
  private workspace: null | fabric.Rect | undefined

  constructor(canvas: fabric.Canvas, editor: Editor, options: Plugin.Options) {
    super(canvas, editor, options)
    this.init()
  }

  // 初始化监听器
  private _initResizeObserve() {
    const resizeObserver = new ResizeObserver(
      throttle(() => {
        this.auto()
      }, 50),
    )
    resizeObserver.observe(this.workspaceEl!)
  }

  private _getScale() {
    const viewPortWidth = this.workspaceEl!.offsetWidth
    const viewPortHeight = this.workspaceEl!.offsetHeight
    // 按照宽度
    if (viewPortWidth / viewPortHeight < this._options.width / this._options.height) {
      return viewPortWidth / this._options.width
    } // 按照宽度缩放
    return viewPortHeight / this._options.height
  }

  // 初始化背景
  private _initBackground() {
    this._canvas.backgroundImage = ''
    this._canvas.setWidth(this.workspaceEl!.offsetWidth)
    this._canvas.setHeight(this.workspaceEl!.offsetHeight)
  }

  // 初始化画布
  private _initWorkspace() {
    const { width, height } = this._options
    const workspace = new fabric.Rect({
      width,
      height,
      left: 0,
      top: 0,
      id: 'workspace',
      name: 'workspace',
      strokeWidth: 0,
      selectable: false,
      hasControls: false,
      stroke: 'black',
      hasBorders: false,
      hoverCursor: 'default',
      moveCursor: 'default',
      scaleX: 1,
      scaleY: 1,
      fill: 'rgba(255, 255, 255, 1)',
      custom: {
        type: 'workspace',
      },
    })
    this._canvas.add(workspace)
    this._canvas.renderAll()
    this.workspace = workspace
    this.auto()
  }

  private _bindWheel() {
    this._canvas.on('mouse:wheel', function (this: fabric.Canvas, opt) {
      const delta = opt.e.deltaY
      let zoom = this.getZoom()
      zoom *= 0.999 ** delta
      if (zoom > 20)
        zoom = 20
      if (zoom < 0.01)
        zoom = 0.01
      const center = this.getCenter()
      this.zoomToPoint(new fabric.Point(center.left, center.top), zoom)
      opt.e.preventDefault()
      opt.e.stopPropagation()

      this.requestRenderAll()
    })
  }

  init() {
    this._options.width = this._options.width || 750
    this._options.height = this._options.height || 1334
    const workspaceEl = document.querySelector('#workspace') as HTMLElement
    if (!workspaceEl) {
      throw new Error('element #workspace is missing, plz check!')
    }
    this.workspaceEl = workspaceEl
    this.workspace = null
    this._initBackground()
    this._initWorkspace()
    this._initResizeObserve()
    this._bindWheel()
    /**
     * 通知编辑器已经 ready
     * NOTE: 仅当 workspace 加载完毕时才算编辑器初始化完成
     */
    this._editor.emit('ready')
  }

  hookImportAfter(): Promise<void> {
    return new Promise((resolve) => {
      const workspace = this._canvas.getObjects().find((item) => {
        return item.id === 'workspace' && item.name === 'workspace'
      })
      if (workspace) {
        workspace.set('selectable', false)
        workspace.set('hasControls', false)
        const { width, height } = workspace
        this.setSize(width!, height!)
        this._editor.emit('sizeChange', workspace.width, workspace.height)
      }
      resolve()
    })
  }

  hookSaveAfter() {
    return new Promise((resolve) => {
      this.auto()
      resolve(true)
    })
  }

  /**
   * 设置画布中心到指定对象中心点上
   * @param {object} obj 指定的对象
   */
  setCenterFromObject(obj: fabric.Rect) {
    const objCenter = obj.getCenterPoint()
    const viewportTransform = this._canvas.viewportTransform
    if (this._canvas.width === undefined || this._canvas.height === undefined || !viewportTransform)
      return
    viewportTransform[4] = this._canvas.width / 2 - objCenter.x * viewportTransform[0]
    viewportTransform[5] = this._canvas.height / 2 - objCenter.y * viewportTransform[3]
    this._canvas.setViewportTransform(viewportTransform)
    this._canvas.renderAll()
  }

  setSize(width: number, height: number) {
    this._initBackground()
    this._options.width = width
    this._options.height = height
    // 重新设置workspace
    this.workspace = this._canvas
      .getObjects()
      .find((item) => {
        return item.id === 'workspace' && item.name === 'workspace'
      }) as fabric.Rect
    this.workspace.set('width', width)
    this.workspace.set('height', height)
    this.auto()
  }

  setZoomAuto(scale: number, cb?: (left?: number, top?: number) => void) {
    const { workspaceEl } = this
    const width = workspaceEl!.offsetWidth
    const height = workspaceEl!.offsetHeight
    this._canvas.setWidth(width)
    this._canvas.setHeight(height)
    const center = this._canvas.getCenter()
    this._canvas.setViewportTransform(fabric.iMatrix.concat())
    this._canvas.zoomToPoint(new fabric.Point(center.left, center.top), scale)
    if (!this.workspace)
      return
    this.setCenterFromObject(this.workspace)

    // 超出画布不展示
    this.workspace.clone((cloned: fabric.Rect) => {
      this._canvas.clipPath = cloned
      this._canvas.requestRenderAll()
    })
    if (cb)
      cb(this.workspace.left, this.workspace.top)
  }

  // 放大
  big() {
    let zoomRatio = this._canvas.getZoom()
    zoomRatio += 0.05
    const center = this._canvas.getCenter()
    this._canvas.zoomToPoint(new fabric.Point(center.left, center.top), zoomRatio)
    this._canvas.requestRenderAll()
  }

  // 缩小
  small() {
    let zoomRatio = this._canvas.getZoom()
    zoomRatio -= 0.05
    const center = this._canvas.getCenter()
    this._canvas.zoomToPoint(
      new fabric.Point(center.left, center.top),
      zoomRatio < 0 ? 0.01 : zoomRatio,
    )
    this._canvas.requestRenderAll()
  }

  // 自动缩放
  auto() {
    const scale = this._getScale()
    this.setZoomAuto(scale - 0.08)
  }

  // 1:1 放大
  one() {
    this.setZoomAuto(0.8 - 0.08)
    this._canvas.requestRenderAll()
  }

  // 只能预览
  enablePreview() {
    this._editor.updateStatus({
      preview: true,
    })
    this._canvas.selection = false
    this._canvas.defaultCursor = 'default'
    this._canvas.getObjects().forEach((obj) => {
      obj.selectable = false
      obj.hasControls = false
      obj.evented = false
    })
    this._canvas.requestRenderAll()
  }

  /**
   * 关闭预览模式
   */
  disabledPreview() {
    this._editor.updateStatus({
      preview: false,
    })
    this._canvas.selection = true
    this._canvas.defaultCursor = 'default'
    this._canvas.getObjects().forEach((obj) => {
      obj.selectable = true
      obj.hasControls = true
      obj.evented = true
    })
    this._canvas.requestRenderAll()
  }
}
