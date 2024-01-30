import type { fabric } from 'fabric'
import type { Editor } from '../core'
import { SelectEvent, SelectMode } from '../utils/event/types'
import type { Ref } from 'vue'
import { ref } from 'vue'

import event from '../utils/event/notifier'
import { Plugin } from './createPlugin'

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

  selectedMode: Ref<SelectMode>
  constructor(canvas: fabric.Canvas, editor: Editor, options: Plugin.Options) {
    super(canvas, editor, options)

    this.selectedMode = ref(SelectMode.EMPTY)
    this.init()
  }

  init() {
    event.on(SelectEvent.ONE, () => (this.selectedMode.value = SelectMode.ONE))
    event.on(SelectEvent.MULTI, () => (this.selectedMode.value = SelectMode.MULTI))
    event.on(SelectEvent.CANCEL, () => (this.selectedMode.value = SelectMode.EMPTY))
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
}
