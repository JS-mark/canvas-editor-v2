/*
 * @Author: Mark
 * @Date: 2023-05-21 08:55:25
 * @LastEditors: Mark
 * @LastEditTime: 2024-02-22 20:48:47
 * @Description: 辅助线功能
 */

import type { Editor } from '../core'

import { fabric } from 'fabric'
import { Plugin } from './createPlugin'

declare interface VerticalLine {
  x: number
  y1: number
  y2: number
}

declare interface HorizontalLine {
  x1: number
  x2: number
  y: number
}

export class AlignGuidLinePlugin extends Plugin.BasePlugin {
  public defaultOption = {
    color: 'rgba(255,95,95,1)',
    width: 1,
  }

  protected get name() {
    return 'AlignGuidLinePlugin'
  }

  protected get hotkeys() {
    return ['space']
  }

  protected get events(): string[] {
    return []
  }

  dragMode = false
  constructor(canvas: fabric.Canvas, editor: Editor, options: Plugin.Options) {
    super(canvas, editor, options)

    this.dragMode = false
    this.init()
  }

  init() {
    const ctx = this._canvas.getSelectionContext()
    const aligningLineOffset = 5
    const aligningLineMargin = 4
    // eslint-disable-next-line ts/no-this-alias
    const This = this
    let viewportTransform: number[] | undefined
    let zoom = 1

    function drawVerticalLine(coords: VerticalLine) {
      drawLine(
        coords.x + 0.5,
        coords.y1 > coords.y2 ? coords.y2 : coords.y1,
        coords.x + 0.5,
        coords.y2 > coords.y1 ? coords.y2 : coords.y1,
      )
    }

    function drawHorizontalLine(coords: HorizontalLine) {
      drawLine(
        coords.x1 > coords.x2 ? coords.x2 : coords.x1,
        coords.y + 0.5,
        coords.x2 > coords.x1 ? coords.x2 : coords.x1,
        coords.y + 0.5,
      )
    }

    function drawLine(x1: number, y1: number, x2: number, y2: number) {
      if (viewportTransform == null)
        return

      ctx.save()
      ctx.lineWidth = This.defaultOption.width
      ctx.strokeStyle = This.defaultOption.color
      ctx.beginPath()
      ctx.moveTo(x1 * zoom + viewportTransform[4], y1 * zoom + viewportTransform[5])
      ctx.lineTo(x2 * zoom + viewportTransform[4], y2 * zoom + viewportTransform[5])
      ctx.stroke()
      ctx.restore()
    }

    function isInRange(value1: number, value2: number) {
      value1 = Math.round(value1)
      value2 = Math.round(value2)
      for (let i = value1 - aligningLineMargin, len = value1 + aligningLineMargin; i <= len; i++) {
        if (i === value2) {
          return true
        }
      }
      return false
    }

    const verticalLines: VerticalLine[] = []
    const horizontalLines: HorizontalLine[] = []

    this._canvas.on('mouse:down', () => {
      viewportTransform = this._canvas.viewportTransform
      zoom = this._canvas.getZoom()
    })

    this._canvas.on('object:moving', (e) => {
      if (viewportTransform === undefined || e.target === undefined)
        return

      const activeObject = e.target
      const canvasObjects = this._canvas.getObjects()
      const activeObjectCenter = activeObject.getCenterPoint()
      const activeObjectLeft = activeObjectCenter.x
      const activeObjectTop = activeObjectCenter.y
      const activeObjectBoundingRect = activeObject.getBoundingRect()
      const activeObjectHeight = activeObjectBoundingRect.height / viewportTransform[3]
      const activeObjectWidth = activeObjectBoundingRect.width / viewportTransform[0]
      let horizontalInTheRange = false
      let verticalInTheRange = false
      // @ts-expect-error
      const transform = canvas._currentTransform

      if (!transform)
        return

      // It should be trivial to DRY this up by encapsulating (repeating) creation of x1, x2, y1, and y2 into functions,
      // but we're not doing it here for perf. reasons -- as this a function that's invoked on every mouse move

      for (let i = canvasObjects.length; i--;) {
        if (canvasObjects[i] === activeObject)
          continue

        // 排除辅助线
        if (
          activeObject instanceof fabric.GuideLine
          && canvasObjects[i] instanceof fabric.GuideLine
        ) {
          continue
        }

        const objectCenter = canvasObjects[i].getCenterPoint()
        const objectLeft = objectCenter.x
        const objectTop = objectCenter.y
        const objectBoundingRect = canvasObjects[i].getBoundingRect()
        const objectHeight = objectBoundingRect.height / viewportTransform[3]
        const objectWidth = objectBoundingRect.width / viewportTransform[0]

        // snap by the horizontal center line
        if (isInRange(objectLeft, activeObjectLeft)) {
          verticalInTheRange = true
          verticalLines.push({
            x: objectLeft,
            y1:
              objectTop < activeObjectTop
                ? objectTop - objectHeight / 2 - aligningLineOffset
                : objectTop + objectHeight / 2 + aligningLineOffset,
            y2:
              activeObjectTop > objectTop
                ? activeObjectTop + activeObjectHeight / 2 + aligningLineOffset
                : activeObjectTop - activeObjectHeight / 2 - aligningLineOffset,
          })
          activeObject.setPositionByOrigin(
            new fabric.Point(objectLeft, activeObjectTop),
            'center',
            'center',
          )
        }

        // snap by the left edge
        if (isInRange(objectLeft - objectWidth / 2, activeObjectLeft - activeObjectWidth / 2)) {
          verticalInTheRange = true
          verticalLines.push({
            x: objectLeft - objectWidth / 2,
            y1:
              objectTop < activeObjectTop
                ? objectTop - objectHeight / 2 - aligningLineOffset
                : objectTop + objectHeight / 2 + aligningLineOffset,
            y2:
              activeObjectTop > objectTop
                ? activeObjectTop + activeObjectHeight / 2 + aligningLineOffset
                : activeObjectTop - activeObjectHeight / 2 - aligningLineOffset,
          })
          activeObject.setPositionByOrigin(
            new fabric.Point(objectLeft - objectWidth / 2 + activeObjectWidth / 2, activeObjectTop),
            'center',
            'center',
          )
        }

        // snap by the right edge
        if (isInRange(objectLeft + objectWidth / 2, activeObjectLeft + activeObjectWidth / 2)) {
          verticalInTheRange = true
          verticalLines.push({
            x: objectLeft + objectWidth / 2,
            y1:
              objectTop < activeObjectTop
                ? objectTop - objectHeight / 2 - aligningLineOffset
                : objectTop + objectHeight / 2 + aligningLineOffset,
            y2:
              activeObjectTop > objectTop
                ? activeObjectTop + activeObjectHeight / 2 + aligningLineOffset
                : activeObjectTop - activeObjectHeight / 2 - aligningLineOffset,
          })
          activeObject.setPositionByOrigin(
            new fabric.Point(objectLeft + objectWidth / 2 - activeObjectWidth / 2, activeObjectTop),
            'center',
            'center',
          )
        }

        // snap by the vertical center line
        if (isInRange(objectTop, activeObjectTop)) {
          horizontalInTheRange = true
          horizontalLines.push({
            y: objectTop,
            x1:
              objectLeft < activeObjectLeft
                ? objectLeft - objectWidth / 2 - aligningLineOffset
                : objectLeft + objectWidth / 2 + aligningLineOffset,
            x2:
              activeObjectLeft > objectLeft
                ? activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset
                : activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset,
          })
          activeObject.setPositionByOrigin(
            new fabric.Point(activeObjectLeft, objectTop),
            'center',
            'center',
          )
        }

        // snap by the top edge
        if (isInRange(objectTop - objectHeight / 2, activeObjectTop - activeObjectHeight / 2)) {
          horizontalInTheRange = true
          horizontalLines.push({
            y: objectTop - objectHeight / 2,
            x1:
              objectLeft < activeObjectLeft
                ? objectLeft - objectWidth / 2 - aligningLineOffset
                : objectLeft + objectWidth / 2 + aligningLineOffset,
            x2:
              activeObjectLeft > objectLeft
                ? activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset
                : activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset,
          })
          activeObject.setPositionByOrigin(
            new fabric.Point(
              activeObjectLeft,
              objectTop - objectHeight / 2 + activeObjectHeight / 2,
            ),
            'center',
            'center',
          )
        }

        // snap by the bottom edge
        if (isInRange(objectTop + objectHeight / 2, activeObjectTop + activeObjectHeight / 2)) {
          horizontalInTheRange = true
          horizontalLines.push({
            y: objectTop + objectHeight / 2,
            x1:
              objectLeft < activeObjectLeft
                ? objectLeft - objectWidth / 2 - aligningLineOffset
                : objectLeft + objectWidth / 2 + aligningLineOffset,
            x2:
              activeObjectLeft > objectLeft
                ? activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset
                : activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset,
          })
          activeObject.setPositionByOrigin(
            new fabric.Point(
              activeObjectLeft,
              objectTop + objectHeight / 2 - activeObjectHeight / 2,
            ),
            'center',
            'center',
          )
        }
      }

      if (!horizontalInTheRange) {
        horizontalLines.length = 0
      }

      if (!verticalInTheRange) {
        verticalLines.length = 0
      }
    })

    this._canvas.on('before:render', () => {
      // fix 保存图片时报错
      try {
        this._canvas.clearContext(this._canvas?.contextTop)
      }
      catch (error) {
        console.error(error)
      }
    })

    this._canvas.on('after:render', () => {
      for (let i = verticalLines.length; i--;) {
        drawVerticalLine(verticalLines[i])
      }
      for (let j = horizontalLines.length; j--;) {
        drawHorizontalLine(horizontalLines[j])
      }

      // noinspection NestedAssignmentJS
      verticalLines.length = 0
      horizontalLines.length = 0
    })

    this._canvas.on('mouse:up', () => {
      verticalLines.length = 0
      horizontalLines.length = 0
      this._canvas.renderAll()
    })
  }

  async mounted() {
    this._editor.emit(`${this.name}:mounted`)
  }
}
