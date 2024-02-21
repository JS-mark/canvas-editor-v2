import type { Plugin } from './createPlugin'

import type {
  DragingPlugin,
  GuidelinesPlugin,
  ControlsPlugin,
  ControlsRotatePlugin,
  CenterAlignPlugin,
  AttrsEditPlugin,
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
  AlignGuidLinePlugin,
  MoveHotKeyPlugin,
  DeleteHotKeyPlugin,
} from '.'

export interface UsePlugin {
  Ctor: Plugin.PluginCtor<any>
  options: Plugin.Options
}

export interface PluginInstance {
  AlignGuidLinePlugin: InstanceType<typeof AlignGuidLinePlugin>
  AttrsEditPlugin: InstanceType<typeof AttrsEditPlugin>
  DragingPlugin: InstanceType<typeof DragingPlugin>
  GuidelinesPlugin: InstanceType<typeof GuidelinesPlugin>
  ControlsPlugin: InstanceType<typeof ControlsPlugin>
  ControlsRotatePlugin: InstanceType<typeof ControlsRotatePlugin>
  CenterAlignPlugin: InstanceType<typeof CenterAlignPlugin>
  LayerPlugin: InstanceType<typeof LayerPlugin>
  CopyPlugin: InstanceType<typeof CopyPlugin>
  MoveHotKeyPlugin: InstanceType<typeof MoveHotKeyPlugin>
  DeleteHotKeyPlugin: InstanceType<typeof DeleteHotKeyPlugin>
  GroupPlugin: InstanceType<typeof GroupPlugin>
  DrawLinePlugin: InstanceType<typeof DrawLinePlugin>
  GroupTextEditorPlugin: InstanceType<typeof GroupTextEditorPlugin>
  GroupAlignPlugin: InstanceType<typeof GroupAlignPlugin>
  WorkspacePlugin: InstanceType<typeof WorkspacePlugin>
  DownFontPlugin: InstanceType<typeof DownFontPlugin>
  FlipPlugin: InstanceType<typeof FlipPlugin>
  RulerPlugin: InstanceType<typeof RulerPlugin>
  ServersPlugin: InstanceType<typeof ServersPlugin>
  [key: string]: InstanceType<typeof Plugin.BasePlugin>
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
export * from './FlipPlugin'
export * from './RulerPlugin'
export * from './DrawLinePlugin'
export * from './ServersPlugin'
export * from './GuidelinesPlugin'
export * from './AttrsEditPlugin'
