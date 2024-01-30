/*
 * @Author: Mark
 * @Date: 2023-01-07 01:15:50
 * @LastEditors: Mark
 * @LastEditTime: 2024-01-30 14:01:02
 * @Description: 箭头元素
 */
import { fabric } from 'fabric'

/**
 * 创建箭头元素
 */
// @ts-expect-error
fabric.Arrow = fabric.util.createClass(fabric.Line, {
  type: 'arrow',
  superType: 'drawing',
  initialize(points: number[], options: fabric.ILineOptions) {
    if (!points) {
      const { x1, x2, y1, y2 } = options
      points = [x1!, y1!, x2!, y2!]
    }
    options = options || {}
    this.callSuper('initialize', points, options)
  },
  _render(ctx: CanvasRenderingContext2D) {
    this.callSuper('_render', ctx)
    ctx.save()
    const xDiff = this.x2 - this.x1
    const yDiff = this.y2 - this.y1
    const angle = Math.atan2(yDiff, xDiff)
    ctx.translate((this.x2 - this.x1) / 2, (this.y2 - this.y1) / 2)
    ctx.rotate(angle)
    ctx.beginPath()
    // Move 5px in front of line to start the arrow so it does not have the square line end showing in front (0,0)
    ctx.moveTo(5, 0)
    ctx.lineTo(-5, 5)
    ctx.lineTo(-5, -5)
    ctx.closePath()
    ctx.fillStyle = this.stroke
    ctx.fill()
    ctx.restore()
  },
})

// @ts-expect-error
fabric.Arrow.fromObject = (options: fabric.ILineOptions, callback: any) => {
  const { x1, x2, y1, y2 } = options
  // @ts-expect-error
  return callback(new fabric.Arrow([x1, y1, x2, y2], options))
}
