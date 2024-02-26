
/*
 * @Description: useSelect(原mixin)  类型待优化
 * @version:
 * @Author: Mark
 * @Date: 2024-01-21 21:10:05
 * @LastEditors: Mark
 * @LastEditTime: 2024-02-26 11:04:21
 */
import { reactive } from 'vue'
import {
  useEditor,
  SelectEvent,
  SelectMode,
  SelectOneCustomType,
  SelectOneType
} from '@tm2js/canvas-editor'
import type { fabric } from 'fabric'

export interface Selector {
  mSelectMode: SelectMode
  mSelectOneType: SelectOneType
  mSelectOneCustomType: SelectOneCustomType
  mSelectId: string[] | string
  mSelectIds: string[]
  mSelectActive: unknown[]
}


export function useEditorSelect() {
  const state = reactive({
    mSelectMode: SelectMode.EMPTY,
    mSelectOneType: SelectOneType.EMPTY,
    mSelectOneCustomType: SelectOneCustomType.EMPTY,
    mSelectId: '', // 选择id
    mSelectIds: [] as string[], // 选择id
    mSelectActive: [] as fabric.Object[],
  })

  const selectOne = (e: fabric.Object[]) => {
    state.mSelectMode = SelectMode.ONE
    state.mSelectId = e[0].id as string
    state.mSelectOneType = e[0].type as SelectOneType.EMPTY
    if (e[0].custom) {
      state.mSelectOneCustomType = e[0].custom.type ? e[0].custom.type as SelectOneCustomType : SelectOneCustomType.EMPTY
    }
    state.mSelectIds = e.map(item => item.id!)
  }

  const selectMulti = (e: fabric.Object[]) => {
    state.mSelectMode = SelectMode.MULTI
    state.mSelectId = ''
    state.mSelectIds = e.map(item => item.id!)
  }

  const selectCancel = () => {
    state.mSelectId = ''
    state.mSelectIds = []
    state.mSelectMode = SelectMode.EMPTY
    state.mSelectOneType = SelectOneType.EMPTY
  }

  useEditor((canvasEditor) => {
    canvasEditor?.on(SelectEvent.ONE, selectOne)
    canvasEditor?.on(SelectEvent.MULTI, selectMulti)
    canvasEditor?.on(SelectEvent.CANCEL, selectCancel)
    // 监听编辑器卸载事件
    canvasEditor.once('editor_before_unmount', () => {
      canvasEditor?.off(SelectEvent.ONE, selectOne)
      canvasEditor?.off(SelectEvent.MULTI, selectMulti)
      canvasEditor?.off(SelectEvent.CANCEL, selectCancel)
    })
  })

  return {
    mixinState: state
  }
}
