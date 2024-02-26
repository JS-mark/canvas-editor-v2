/*
 * @Author: Mark
 * @Date: 2024-01-22 23:00:43
 * @LastEditors: Mark
 * @LastEditTime: 2024-02-26 14:42:38
 * @Description: 控制条插件
 */

import { fabric } from 'fabric'
import { PiBy180 } from '../core/constant'
import { Plugin } from './createPlugin'
import verticalImg from '../assets/editor/middlecontrol.svg'
import horizontalImg from '../assets/editor/middlecontrolhoz.svg'
import edgeImg from '../assets/editor/edgecontrol.svg'
import rotateImg from '../assets/editor/rotateicon.svg'
import type { Editor } from '../core'

/**
 * 更新ml, mr, mt, mb的控件大小
 */
const setCornersSize = (object: fabric.Object) => {
  if (!object.canvas)
    return
  const zoom = object.canvas.getZoom()
  const size = object.getWidthHeight().multiply(zoom)
  const controls = object.controls
  const cornersH = ['ml', 'mr']
  cornersH.forEach((corner) => {
    controls[corner].sizeX = object.cornerSize
    controls[corner].sizeY = size.y
    // @ts-expect-error
    controls[corner].touchSizeX = object.touchCornerSize
    controls[corner].touchSizeY = size.y
  })
  const cornersV = ['mt', 'mb']
  cornersV.forEach((corner) => {
    controls[corner].sizeX = size.x
    controls[corner].sizeY = object.cornerSize
    controls[corner].touchSizeX = size.x
    // @ts-expect-error
    controls[corner].touchSizeY = object.touchCornerSize
  })
}

function drawImg(
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  img: HTMLImageElement,
  wSize: number,
  hSize: number,
  angle: number | undefined,
) {
  if (angle === undefined)
    return
  ctx.save()
  ctx.translate(left, top)
  ctx.rotate(fabric.util.degreesToRadians(angle))
  ctx.drawImage(img, -wSize / 2, -hSize / 2, wSize, hSize)
  ctx.restore()
}

export class ControlsPlugin extends Plugin.BasePlugin {
  get name() {
    return 'ControlsPlugin'
  }

  get hotkeys(): string[] {
    return []
  }

  get events(): string[] {
    return []
  }

  constructor(canvas: fabric.Canvas, editor: Editor, options: Plugin.Options) {
    super(canvas, editor, options)
    this._fabric = options.fabric
    this.init()
  }



  // 中间横杠
  intervalControl() {
    const verticalImgIcon = document.createElement('img')
    verticalImgIcon.src = verticalImg

    const horizontalImgIcon = document.createElement('img')
    horizontalImgIcon.src = horizontalImg

    function renderIcon(
      ctx: CanvasRenderingContext2D,
      left: number,
      top: number,
      _: any,
      fabricObject: fabric.Object,
    ) {
      drawImg(ctx, left, top, verticalImgIcon, 18, 16, fabricObject.angle)
    }

    function renderIconHoz(
      ctx: CanvasRenderingContext2D,
      left: number,
      top: number,
      _: any,
      fabricObject: fabric.Object,
    ) {
      drawImg(ctx, left, top, horizontalImgIcon, 16, 12, fabricObject.angle)
    }
    // 左侧中间横杠
    const ml = new fabric.Control({
      x: -0.5,
      y: 0,
      offsetX: -1,
      cursorStyleHandler: fabric.controlsUtils.scaleSkewCursorStyleHandler,
      actionHandler: fabric.controlsUtils.scalingXOrSkewingY,
      getActionName: fabric.controlsUtils.scaleOrSkewActionName,
      render: renderIcon,
    })
    // 右侧中间横杠
    const mr = new fabric.Control({
      x: 0.5,
      y: 0,
      offsetX: 1,
      cursorStyleHandler: fabric.controlsUtils.scaleSkewCursorStyleHandler,
      actionHandler: fabric.controlsUtils.scalingXOrSkewingY,
      getActionName: fabric.controlsUtils.scaleOrSkewActionName,
      render: renderIcon,
    })

    // 左中间横杠
    this._fabric.Object.prototype.controls.ml = ml
    // 右边中间横杠
    this._fabric.Object.prototype.controls.mr = mr

    // Textbox
    const origin = fabric.Textbox.prototype.controls
    this._fabric.Textbox.prototype.controls.ml = new fabric.Control({
      x: -0.5,
      y: 0,
      offsetX: -1,
      cursorStyleHandler: origin.ml.cursorStyleHandler,
      actionHandler: origin.ml.actionHandler,
      getActionName: origin.ml.getActionName,
      render: renderIcon,
    })

    // Textbox
    this._fabric.Textbox.prototype.controls.mr = new fabric.Control({
      x: 0.5,
      y: 0,
      offsetX: 1,
      cursorStyleHandler: origin.mr.cursorStyleHandler,
      actionHandler: origin.mr.actionHandler,
      getActionName: origin.mr.getActionName,
      render: renderIcon,
    })

    this._fabric.Object.prototype.controls.mb = new fabric.Control({
      x: 0,
      y: 0.5,
      offsetY: 1,
      cursorStyleHandler: fabric.controlsUtils.scaleSkewCursorStyleHandler,
      actionHandler: fabric.controlsUtils.scalingYOrSkewingX,
      getActionName: fabric.controlsUtils.scaleOrSkewActionName,
      render: renderIconHoz,
    })

    this._fabric.Object.prototype.controls.mt = new fabric.Control({
      x: 0,
      y: -0.5,
      offsetY: -1,
      cursorStyleHandler: fabric.controlsUtils.scaleSkewCursorStyleHandler,
      actionHandler: fabric.controlsUtils.scalingYOrSkewingX,
      getActionName: fabric.controlsUtils.scaleOrSkewActionName,
      render: renderIconHoz,
    })
  }

  // 顶点
  peakControl() {
    const img = document.createElement('img')
    img.src = edgeImg

    function renderIconEdge(
      ctx: CanvasRenderingContext2D,
      left: number,
      top: number,
      _: any,
      fabricObject: fabric.Object,
    ) {
      drawImg(ctx, left, top, img, 16, 16, fabricObject.angle)
    }

    this._fabric.Object.prototype.getWidthHeight = function (noFixed = false) {
      const point = { x: this.width! * this.scaleX!, y: this.height! * this.scaleY! }
      if (!noFixed) {
        point.x = Number(point.x.toFixed(2))
        point.y = Number(point.y.toFixed(2))
      }

      return new fabric.Point(point.x, point.y)
    }

    // 显示元素大小
    this._fabric.Object.prototype.controls.size = new fabric.Control({
      x: 0,
      y: 0.5,
      cursorStyleHandler: () => '',
      offsetY: 20,
      sizeX: 0.0001,
      sizeY: 0.0001,
      touchSizeX: 0.0001,
      touchSizeY: 0.0001,
      render: (ctx, left, top, _, fabricObject: fabric.Object) => {
        // todo: 支持组内反转的对象
        ctx.save()
        ctx.translate(left, top)

        const calcRotate = () => {
          const opt = fabric.util.qrDecompose(fabricObject.calcTransformMatrix())
          const objectAngle = fabricObject.group ? opt.angle! : fabricObject.angle!
          const angleInRadians = objectAngle * PiBy180
          const x = Math.sin(angleInRadians)
          const y = Math.cos(angleInRadians)
          const angle = Math.abs(x) > Math.abs(y) ? Math.sign(x) * 90 : Math.sign(y) * 90 - 90
          return (objectAngle - angle) * PiBy180
        }

        ctx.rotate(calcRotate())

        const fontSize = 12
        ctx.font = `${fontSize}px Tahoma`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        const { x, y } = fabricObject.getWidthHeight()
        const text = `${x} × ${y}`
        const width = ctx.measureText(text).width + 8
        const height = fontSize + 10

        // 背景
        ctx.roundRect(-width / 2, -height / 2, width, height, 4)
        ctx.fillStyle = '#0066ff'
        ctx.fill()

        // 文字
        ctx.fillStyle = '#fff'
        ctx.fillText(text, 0, 1)
        ctx.restore()
      },
      positionHandler(dim, finalMatrix, fabricObject: fabric.Object) {
        const activeObject = fabricObject.canvas?.getActiveObject()
        if (activeObject && activeObject === fabricObject) {
          const opt = fabric.util.qrDecompose(fabricObject.calcTransformMatrix())

          const angleInRadians = opt.angle * PiBy180

          const x = Math.sin(angleInRadians)
          const y = Math.cos(angleInRadians)

          if (Math.abs(x) >= Math.abs(y)) {
            const sign = Math.sign(x)
            this.x = sign / 2
            this.y = 0
            this.offsetX = sign * 14
            this.offsetY = 0
          }
          else {
            const sign = Math.sign(y)
            this.x = 0
            this.y = sign / 2
            this.offsetX = 0
            this.offsetY = sign * 20
          }

          // 更新其它corners大小，放到这里一起更新，来防止多次运行
          setCornersSize(fabricObject)
        }

        return fabric.util.transformPoint(
          new fabric.Point(
            this.x! * dim.x + (this.offsetX || 0),
            this.y! * dim.y + (this.offsetY || 0),
          ),
          finalMatrix,
        )
      },
    })

    // 四角图标
    this._fabric.Object.prototype.controls.tl = new fabric.Control({
      x: -0.5,
      y: -0.5,
      cursorStyleHandler: fabric.controlsUtils.scaleCursorStyleHandler,
      actionHandler: fabric.controlsUtils.scalingEqually,
      render: renderIconEdge,
    })
    this._fabric.Object.prototype.controls.bl = new fabric.Control({
      x: -0.5,
      y: 0.5,
      cursorStyleHandler: fabric.controlsUtils.scaleCursorStyleHandler,
      actionHandler: fabric.controlsUtils.scalingEqually,
      render: renderIconEdge,
    })
    this._fabric.Object.prototype.controls.tr = new fabric.Control({
      x: 0.5,
      y: -0.5,
      cursorStyleHandler: fabric.controlsUtils.scaleCursorStyleHandler,
      actionHandler: fabric.controlsUtils.scalingEqually,
      render: renderIconEdge,
    })
    this._fabric.Object.prototype.controls.br = new fabric.Control({
      x: 0.5,
      y: 0.5,
      cursorStyleHandler: fabric.controlsUtils.scaleCursorStyleHandler,
      actionHandler: fabric.controlsUtils.scalingEqually,
      render: renderIconEdge,
    })
  }
  // 删除
  deleteControl(canvas: fabric.Canvas) {
    const deleteIcon
      = 'data:image/svg+xml,%3C%3Fxml version=\'1.0\' encoding=\'utf-8\'%3F%3E%3C!DOCTYPE svg PUBLIC \'-//W3C//DTD SVG 1.1//EN\' \'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\'%3E%3Csvg version=\'1.1\' id=\'Ebene_1\' xmlns=\'http://www.w3.org/2000/svg\' xmlns:xlink=\'http://www.w3.org/1999/xlink\' x=\'0px\' y=\'0px\' width=\'595.275px\' height=\'595.275px\' viewBox=\'200 215 230 470\' xml:space=\'preserve\'%3E%3Ccircle style=\'fill:%23F44336;\' cx=\'299.76\' cy=\'439.067\' r=\'218.516\'/%3E%3Cg%3E%3Crect x=\'267.162\' y=\'307.978\' transform=\'matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)\' style=\'fill:white;\' width=\'65.545\' height=\'262.18\'/%3E%3Crect x=\'266.988\' y=\'308.153\' transform=\'matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)\' style=\'fill:white;\' width=\'65.544\' height=\'262.179\'/%3E%3C/g%3E%3C/svg%3E'
    const delImg = document.createElement('img')
    delImg.src = deleteIcon

    function renderDelIcon(
      ctx: CanvasRenderingContext2D,
      left: number,
      top: number,
      _: any,
      fabricObject: fabric.Object,
    ) {
      drawImg(ctx, left, top, delImg, 24, 24, fabricObject.angle)
    }

    // 删除选中元素
    function deleteObject(_: MouseEvent, target: fabric.Transform) {
      if (target.action === 'rotate')
        return true
      const activeObject = canvas.getActiveObjects()
      if (activeObject) {
        activeObject.map((item) => {
          canvas.remove(item)
        })
        canvas.requestRenderAll()
        canvas.discardActiveObject()
      }
      return true
    }

    const deleteControl = new fabric.Control({
      x: 0,
      y: -0.5,
      offsetY: -25,
      offsetX: 2,
      cursorStyle: 'pointer',
      mouseUpHandler: deleteObject,
      render: renderDelIcon,
    })

    // Textbox
    this._fabric.Textbox.prototype.controls.deleteControl = deleteControl

    // 删除图标
    this._fabric.Object.prototype.controls.deleteControl = deleteControl
  }

  // 旋转
  rotationControl() {
    const img = document.createElement('img')
    img.src = rotateImg
    function renderIconRotate(
      ctx: CanvasRenderingContext2D,
      left: number,
      top: number,
      _: any,
      fabricObject: fabric.Object,
    ) {
      drawImg(ctx, left, top, img, 40, 40, fabricObject.angle)
    }

    // 旋转图标
    this._fabric.Object.prototype.controls.mtr = new fabric.Control({
      x: 0,
      y: 0.5,
      cursorStyleHandler: fabric.controlsUtils.rotationStyleHandler,
      actionHandler: fabric.controlsUtils.rotationWithSnapping,
      offsetY: 30,
      // withConnecton: false,
      actionName: 'rotate',
      render: renderIconRotate,
    })
  }

  hideIntervalControl() {
    // 隐藏中间操作图标
    this._fabric.Object.prototype.setControlsVisibility({
      mb: false, // 下中
      ml: false, // 中左
      mr: false, // 中右
      mt: false, // 上中
    })
  }

  init() {

    /**
     * 实际场景: 在进行某个对象缩放的时候，由于fabricjs默认精度使用的是toFixed(2)。
     * 此处为了缩放的精度更准确一些，因此将NUM_FRACTION_DIGITS默认值改为4，即toFixed(4).
     */
    this._fabric.Object.NUM_FRACTION_DIGITS = 4
    // 删除图标
    this.deleteControl(this._canvas)
    // 顶点图标
    this.peakControl()
    // 中间横杠图标
    this.intervalControl()

    // 选中样式更新
    this._fabric.Object.prototype.set({
      transparentCorners: false,
      borderColor: '#51B9F9',
      cornerColor: '#FFF',
      borderScaleFactor: 1,
      padding: 6,
      // 默认背景色为 透明
      backgroundColor: 'transparent',
      // 选中背景色
      selectionBackgroundColor: 'transparent',
      cornerStyle: 'circle',
      cornerStrokeColor: '#0E98FC',
      // 选中移动时透明度
      borderOpacityWhenMoving: 1,
    })
  }
}
