import type { Plugin } from './createPlugin'

import {
  type AlignGuidLinePlugin,
  AttrsEditPlugin,
  ContextMenuPlugin,
  DragingPlugin,
  InsertQRCodePlugin,
  GuidelinesPlugin,
  ControlsPlugin,
  ControlsRotatePlugin,
  CenterAlignPlugin,
  LayerPlugin,
  CopyPlugin,
  MoveHotKeyPlugin,
  DeleteHotKeyPlugin,
  GroupPlugin,
  DrawLinePlugin,
  GroupTextEditorPlugin,
  GroupAlignPlugin,
  WorkspacePlugin,
  DownFontPlugin,
  HistoryPlugin,
  FlipPlugin,
  RulerPlugin,
  ServersPlugin,
} from '.'

export interface UsePlugin {
  Ctor: Plugin.PluginCtor
  options: Plugin.Options
}

export interface PluginInstance {
  InsertQRCodePlugin: InstanceType< typeof InsertQRCodePlugin>
  AlignGuidLinePlugin: InstanceType< typeof AlignGuidLinePlugin>
  AttrsEditPlugin: InstanceType< typeof AttrsEditPlugin>
  DragingPlugin: InstanceType< typeof DragingPlugin>
  GuidelinesPlugin: InstanceType< typeof GuidelinesPlugin>
  ControlsPlugin: InstanceType< typeof ControlsPlugin>
  ControlsRotatePlugin: InstanceType< typeof ControlsRotatePlugin>
  CenterAlignPlugin: InstanceType< typeof CenterAlignPlugin>
  LayerPlugin: InstanceType< typeof LayerPlugin>
  CopyPlugin: InstanceType< typeof CopyPlugin>
  MoveHotKeyPlugin: InstanceType< typeof MoveHotKeyPlugin>
  DeleteHotKeyPlugin: InstanceType< typeof DeleteHotKeyPlugin>
  GroupPlugin: InstanceType< typeof GroupPlugin>
  DrawLinePlugin: InstanceType< typeof DrawLinePlugin>
  GroupTextEditorPlugin: InstanceType< typeof GroupTextEditorPlugin>
  GroupAlignPlugin: InstanceType< typeof GroupAlignPlugin>
  WorkspacePlugin: InstanceType< typeof WorkspacePlugin>
  DownFontPlugin: InstanceType< typeof DownFontPlugin>
  HistoryPlugin: InstanceType< typeof HistoryPlugin>
  FlipPlugin: InstanceType< typeof FlipPlugin>
  RulerPlugin: InstanceType< typeof RulerPlugin>
  ServersPlugin: InstanceType< typeof ServersPlugin>
  ContextMenuPlugin: InstanceType< typeof ContextMenuPlugin>
}

// 导出创建插件基类
export * from './createPlugin'
// 导出所有插件
export * from './DragingPlugin'
export * from './AlignGuidLinePlugin'
export * from './ControlsPlugin'
export * from './ControlsRotatePlugin'
export * from './CenterAlignPlugin'
export * from './LayerPlugin'
export * from './CopyPlugin'
export * from './MoveHotKeyPlugin'
export * from './DeleteHotKeyPlugin'
export * from './GroupPlugin'
export * from './GroupTextEditorPlugin'
export * from './GroupAlignPlugin'
export * from './WorkspacePlugin'
export * from './DownFontPlugin'
export * from './HistoryPlugin'
export * from './FlipPlugin'
export * from './RulerPlugin'
export * from './DrawLinePlugin'
export * from './ServersPlugin'
export * from './GuidelinesPlugin'
export * from './ContextMenuPlugin'
export * from './AttrsEditPlugin'
export * from './InsertQRCodePlugin'

// 导出所有插件
export const EditorPlugins = [
  { Ctor: InsertQRCodePlugin, options: {} },
  { Ctor: DragingPlugin, options: {} },
  { Ctor: AttrsEditPlugin, options: {} },
  { Ctor: ContextMenuPlugin, options: { supportMenu: ['group', 'layer', 'general'] } },
  { Ctor: GuidelinesPlugin, options: {} },
  { Ctor: ControlsPlugin, options: {} },
  // 设置旋转
  { Ctor: ControlsRotatePlugin, options: {} },
  { Ctor: CenterAlignPlugin, options: {} },
  { Ctor: LayerPlugin, options: {} },
  { Ctor: CopyPlugin, options: {} },
  { Ctor: MoveHotKeyPlugin, options: {} },
  { Ctor: DeleteHotKeyPlugin, options: {} },
  { Ctor: GroupPlugin, options: {} },
  { Ctor: DrawLinePlugin, options: {} },
  { Ctor: GroupTextEditorPlugin, options: {} },
  { Ctor: GroupAlignPlugin, options: {} },
  { Ctor: WorkspacePlugin, options: {} },
  { Ctor: DownFontPlugin, options: {} },
  { Ctor: HistoryPlugin, options: {} },
  { Ctor: FlipPlugin, options: {} },
  { Ctor: RulerPlugin, options: {} },
  { Ctor: ServersPlugin, options: {} },
] as UsePlugin[]
