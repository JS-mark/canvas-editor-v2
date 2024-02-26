/*
 * @Author: Mark
 * @Date: 2023-07-04 23:45:49
 * @LastEditors: Mark
 * @LastEditTime: 2024-02-22 20:50:54
 * @Description: 标尺插件
 */

import type { fabric } from 'fabric'
import type { Editor } from '../core'

import initRuler from '../core/ruler'
import { Plugin } from './createPlugin'

export class RulerPlugin extends Plugin.BasePlugin {
  get name() {
    return 'RulerPlugin'
  }

  get hotkeys(): string[] {
    return []
  }

  get events(): string[] {
    return []
  }

  ruler: any
  constructor(canvas: fabric.Canvas, editor: Editor, options: Plugin.Options) {
    super(canvas, editor, options)
    this.init()
  }

  hookSaveBefore() {
    return new Promise((resolve) => {
      this.hideGuideline()
      resolve(true)
    })
  }

  hookSaveAfter() {
    return new Promise((resolve) => {
      this.showGuideline()
      resolve(true)
    })
  }

  init() {
    this.ruler = initRuler(this._canvas)
  }

  hideGuideline() {
    this.ruler.hideGuideline()
  }

  showGuideline() {
    this.ruler.showGuideline()
  }

  rulerEnable() {
    this.ruler.enable()
  }

  rulerDisable() {
    this.ruler.disable()
  }

  async mounted() {
    this._editor.emit(`${this.name}:mounted`)
  }
}
