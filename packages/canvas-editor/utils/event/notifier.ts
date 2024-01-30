/*
 * @Author: Mark
 * @Date: 2022-09-03 19:16:55
 * @LastEditors: Mark
 * @LastEditTime: 2024-01-24 13:08:54
 * @Description: 自定义事件
 */

import { fabric } from 'fabric'
import { SelectEvent } from './types'
import EventEmitter from 'eventemitter3'

/**
 * 发布订阅器
 */
class CanvasEventEmitter extends EventEmitter {
  handler: fabric.Canvas | undefined
  mSelectMode = ''

  init(handler: CanvasEventEmitter['handler']) {
    this.handler = handler
    if (this.handler) {
      this.handler.on('selection:created', () => this.selected())
      this.handler.on('selection:updated', () => this.selected())
      this.handler.on('selection:cleared', () => this.selected())
    }
  }

  /**
   * 暴露单选多选事件
   * @private
   */
  private selected() {
    if (!this.handler) {
      throw new TypeError('还未初始化')
    }

    const actives = this.handler
      .getActiveObjects()
      .filter(item => !(item instanceof fabric.GuideLine)) // 过滤掉辅助线
    if (actives && actives.length === 1) {
      this.emit(SelectEvent.ONE, actives)
    }
    else if (actives && actives.length > 1) {
      this.mSelectMode = 'multiple'
      this.emit(SelectEvent.MULTI, actives)
    }
    else {
      this.emit(SelectEvent.CANCEL)
    }
  }
}

export default new CanvasEventEmitter()

export { CanvasEventEmitter }
