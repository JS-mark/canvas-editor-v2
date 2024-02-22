import type { Editor } from '../core'
import notifier from '../utils/event/notifier'
import { version } from '../package.json'
const EDITOR_KEY = '__canvas_editor'
type UseEditorCB = (editor: Editor) => void

/**
 * 使用editor
 * @returns void
 */
export function useEditor(cb: UseEditorCB): void {
  if (window[EDITOR_KEY]) {
    cb && cb(window[EDITOR_KEY].core)
    return
  }
  // 监听
  notifier.once('init-editor', (editor: Editor) => {
    cb && cb(editor)
  })
}

/**
 * 更新数据
 * @param editor
 */
export const setEditor = (editor: Editor) => {
  window[EDITOR_KEY] = {
    version,
    core: editor
  }
  // 通知
  notifier.emit('init-editor', editor)
}
