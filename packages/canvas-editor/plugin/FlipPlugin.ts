import { Plugin } from './createPlugin'
import { SelectEvent, SelectMode } from '../utils/event/types'

import type { fabric } from 'fabric'
import type { Editor } from '../core'
export class FlipPlugin extends Plugin.BasePlugin {
  get name() {
    return 'FlipPlugin'
  }

  get events(): string[] {
    return []
  }

  get hotkeys(): string[] {
    return []
  }

  selectedMode: SelectMode
  constructor(canvas: fabric.Canvas, editor: Editor, options: Plugin.Options) {
    super(canvas, editor, options)

    this.selectedMode = SelectMode.EMPTY
    this.init()
  }

  init() {
    this._editor.on(SelectEvent.ONE, () => (this.selectedMode = SelectMode.ONE))
    this._editor.on(SelectEvent.MULTI, () => (this.selectedMode = SelectMode.MULTI))
    this._editor.on(SelectEvent.CANCEL, () => (this.selectedMode = SelectMode.EMPTY))
  }

  /**
   * 翻转
   * @param type
   */
  flip(type: 'X' | 'Y') {
    const activeObject = this._canvas.getActiveObject()
    if (activeObject) {
      activeObject.set(`flip${type}`, !activeObject[`flip${type}`]).setCoords()
      this._canvas.requestRenderAll()
    }
  }

  async mounted() {
    this._editor.emit(`${this.name}:mounted`)
  }

  async destroy() {
    this._editor.off(SelectEvent.ONE, () => (this.selectedMode = SelectMode.ONE))
    this._editor.off(SelectEvent.MULTI, () => (this.selectedMode = SelectMode.MULTI))
    this._editor.off(SelectEvent.CANCEL, () => (this.selectedMode = SelectMode.EMPTY))
  }
}
