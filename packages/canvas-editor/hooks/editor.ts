import { inject } from 'vue'

import type { fabric } from 'fabric'
import type { Editor } from '@/canvas-editor/core'
import type { CanvasEventEmitter } from '../utils/event/notifier'

/**
 * 使用editor
 * @returns any
 */
export const useEditor = () => {
  return {
    fabric: inject<typeof fabric>('fabric'),
    event: inject<CanvasEventEmitter>('event'),
    canvasEditor: inject<Editor>('canvasEditor'),
  }
}
