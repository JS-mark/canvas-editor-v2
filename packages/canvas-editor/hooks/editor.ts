import type { Editor } from '../core'
import { version } from '../package.json'
import notifier from '../utils/event/notifier'

const EDITOR_KEY = '__canvas_editor'
type UseEditorCB = (editor: Editor) => void

/**
 * 使用editor
 * @returns void | Promise<Editor>
 */
export function useEditor(): Promise<Editor>
export function useEditor(cb: UseEditorCB): void
export function useEditor(cb?: UseEditorCB): void | Promise<Editor> {
  const useEditorCB = (cb: (editor: Editor) => void) => {
    if (window[EDITOR_KEY]) {
      return cb(window[EDITOR_KEY].core)
    }
    notifier.once('editor_init', (editor: Editor) => {
      cb && cb(editor)
    })
  }
  if (!cb) {
    return new Promise((resolve) => {
      useEditorCB(resolve)
    })
  }
  // 直接调用 cb
  useEditorCB(cb)
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
  notifier.emit('editor_init', editor)
}
