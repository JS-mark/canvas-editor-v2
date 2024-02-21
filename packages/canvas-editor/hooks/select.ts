/*
 * @Description: useSelect(原mixin)  类型待优化
 * @version:
 * @Author: Mark
 * @Date: 2024-01-21 21:10:05
 * @LastEditors: Mark
 * @LastEditTime: 2024-02-03 23:39:47
 */
import { useEditor } from './editor'
import { onBeforeUnmount, onMounted, reactive } from 'vue'
import { SelectEvent, SelectMode, SelectOneCustomType, SelectOneType } from '../utils/event/types'
import type { fabric } from 'fabric'

interface Selector {
  mSelectMode: SelectMode
  mSelectOneType: SelectOneType
  mSelectOneCustomType: SelectOneCustomType
  mSelectId: string[] | string
  mSelectIds: string[]
  mSelectActive: unknown[]
}

export function useSelect() {
  const { event } = useEditor()
  const state = reactive<Selector>({
    mSelectMode: SelectMode.EMPTY,
    mSelectOneType: SelectOneType.EMPTY,
    mSelectOneCustomType: SelectOneCustomType.EMPTY,
    mSelectId: '', // 选择id
    mSelectIds: [], // 选择id
    mSelectActive: [],
  })

  const selectOne = (e: fabric.Object[]) => {
    state.mSelectMode = SelectMode.ONE
    state.mSelectId = e[0].id as string
    state.mSelectOneType = e[0].type as SelectOneType.EMPTY
    if (e[0].custom) {
      state.mSelectOneCustomType = ['qrcode', 'dateTB'].includes(e[0].custom.type) ? e[0].custom.type as SelectOneCustomType : SelectOneCustomType.EMPTY
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

  onMounted(() => {
    event?.on(SelectEvent.ONE, selectOne)
    event?.on(SelectEvent.MULTI, selectMulti)
    event?.on(SelectEvent.CANCEL, selectCancel)
  })

  onBeforeUnmount(() => {
    event?.off(SelectEvent.ONE, selectOne)
    event?.off(SelectEvent.MULTI, selectMulti)
    event?.off(SelectEvent.CANCEL, selectCancel)
  })

  return {
    mixinState: state,
  }
}
