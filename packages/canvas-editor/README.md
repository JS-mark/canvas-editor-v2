# @tm2js/canvas-editor

- 是什么？
  - 基于fabric.js的canvas编辑器核心库
- 能做什么？
  - 支持扩展插件
  - 高度自由的插件系统，方便开发者开发各种各样的功能

## 安装

```bash
pnpm add @tm2js/canvas-editor
```

## 使用

```vue
<template>
  <div class="demo">
    <canvas id="canvas"></canvas>
  </div>
</template>

<script lang="ts" setup>
import '@tm2js/canvas-editor/dist/index.css'
import { createCore, WorkspacePlugin } from '@tm2js/canvas-editor'
// new 一个编辑器核心
const core = createCore()

// 创建fabric canvas实例
const canvas = new fabric.Canvas('canvas', {
  width: 800,
  height: 600,
  backgroundColor: '#f5f5f5'
})
// 初始化编辑器
core.init(canvas)
// 使用编辑器插件
core.use({ Ctor: WorkspacePlugin, options: {} })
</script>
```

### 使用 hook

```vue
<script lang="ts" setup>
import { useEditor } from '@tm2js/canvas-editor'
// 结构一个编辑器实例
const { canvasEditor } = useEditor()
</script>
```

## 插件

### 开发插件

- 插件是一个类，需要继承`BasePlugin`类

```ts
import { Plugin, type Editor } from '@tm2js/canvas-editor'
// 使用命名空间创建插件
export class DemoPlugin extends Plugin.BasePlugin {
  get name() {
    return 'DemoPlugin'
  }

  constructor(canvas: fabric.Canvas, editor: Editor, options: Plugin.Options) {
    super(canvas, editor, options)
  }

  // 插件生命周期
  async mounted() {}
  async destroyed() {}
}
```
