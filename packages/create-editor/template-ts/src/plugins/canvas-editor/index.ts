import { fabric } from 'fabric'
import { HistoryPlugin } from './plugins/HistoryPlugin'
import { ContextMenuPlugin } from './plugins/ContextMenuPlugin'

import {
  ControlsPlugin,
  ControlsRotatePlugin,
  MoveHotKeyPlugin,
  DeleteHotKeyPlugin,
  DragingPlugin,
  AttrsEditPlugin,
  GuidelinesPlugin,
  CenterAlignPlugin,
  LayerPlugin,
  CopyPlugin,
  GroupPlugin,
  DrawLinePlugin,
  GroupTextEditorPlugin,
  GroupAlignPlugin,
  WorkspacePlugin,
  DownFontPlugin,
  FlipPlugin,
  RulerPlugin,
  ServersPlugin,
  createCore,
  CanvasEventEmitter,
  type UsePlugin,
} from '@tm2js/canvas-editor'

export { HistoryPlugin } from './plugins/HistoryPlugin'
export { ContextMenuPlugin } from './plugins/ContextMenuPlugin'

/**
 * 初始化
 * @param canvas
 * @param plugins
 */
export const useCanvasEditor = (canvas: fabric.Canvas, plugins: UsePlugin[]) => {
  const core = createCore()
  const event = new CanvasEventEmitter()
  if (import.meta.env.DEV) {
    core.config = { debug: true }
  }

  // 初始化
  core.init(canvas)
  // 使用插件
  core.use([
    // 首先加载 workspace
    { Ctor: WorkspacePlugin, options: {} },
    // 设置旋转
    {
      Ctor: ControlsRotatePlugin, options: {
        fabric
      }
    },
    { Ctor: DragingPlugin, options: {} },
    { Ctor: AttrsEditPlugin, options: {} },
    { Ctor: GuidelinesPlugin, options: {} },
    { Ctor: ControlsPlugin, options: { fabric } },
    { Ctor: CenterAlignPlugin, options: {} },
    { Ctor: LayerPlugin, options: {} },
    { Ctor: CopyPlugin, options: {} },
    { Ctor: GroupPlugin, options: {} },
    { Ctor: DrawLinePlugin, options: {} },
    { Ctor: GroupTextEditorPlugin, options: {} },
    { Ctor: GroupAlignPlugin, options: {} },
    { Ctor: DownFontPlugin, options: {} },
    { Ctor: FlipPlugin, options: {} },
    { Ctor: RulerPlugin, options: {} },
    { Ctor: ServersPlugin, options: {} },
    { Ctor: MoveHotKeyPlugin, options: { enableLockMove: false } },
    { Ctor: DeleteHotKeyPlugin, options: { enableLockRemove: false } },
    { Ctor: HistoryPlugin, options: { maxStack: 100 } },
    // 右键菜单
    {
      Ctor: ContextMenuPlugin,
      options: {
        supportMenu: ['group', 'layer', 'general'],
      },
    },
    ...plugins
  ])

  // 初始化事件
  event.init(core)

  onBeforeUnmount(() => {
    core?.unMounted();
  });
}

export * from './hooks'
