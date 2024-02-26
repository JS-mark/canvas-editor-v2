/*
 * @Author: Mark
 * @Date: 2022-09-03 19:16:55
 * @LastEditors: Mark
 * @LastEditTime: 2024-02-26 10:50:34
 * @Description: 自定义事件
 */

import { fabric } from 'fabric'
import { SelectEvent } from './types'
import EventEmitter from 'eventemitter3'
import type { Editor } from '../../core'

/**
 * 发布订阅器
 */
class CanvasEventEmitter extends EventEmitter {
  _editor?: Editor
  mSelectMode = ''

  init(editor: Editor) {
    this._editor = editor
    if (this._editor) {
      this._editor.canvas?.on('selection:created', () => this.selected())
      this._editor.canvas?.on('selection:updated', () => this.selected())
      this._editor.canvas?.on('selection:cleared', () => this.selected())
    }
  }

  /**
   * 暴露单选多选事件
   * @private
   */
  private selected() {
    if (!this._editor) {
      throw new TypeError('还未初始化')
    }

    const actives = this._editor.canvas
      ?.getActiveObjects()
      .filter(item => !(item instanceof fabric.GuideLine)) // 过滤掉辅助线
    if (actives && actives.length === 1) {
      this._editor.emit(SelectEvent.ONE, actives)
    }
    else if (actives && actives.length > 1) {
      this.mSelectMode = 'multiple'
      this._editor.emit(SelectEvent.MULTI, actives)
    }
    else {
      this._editor.emit(SelectEvent.CANCEL)
    }
  }
}

export default new CanvasEventEmitter()

export { CanvasEventEmitter }
