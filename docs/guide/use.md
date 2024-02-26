# @tm2js/canvas-editor

## 使用

```vue
<template>
  <div class="demo">
    <canvas id="canvas"></canvas>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount } from 'vue'
import { createCore, WorkspacePlugin } from '@tm2js/canvas-editor'
// new 一个编辑器核心
const core = createCore()
const event = new CanvasEventEmitter()
if (import.meta.env.DEV) {
  core.config = { debug: true }
}
// 创建fabric canvas实例
const canvas = new fabric.Canvas('canvas', {
  width: 800,
  height: 600,
  backgroundColor: '#f5f5f5'
})
// 初始化编辑器
core.init(canvas)
// 使用编辑器插件
core.use(
  { Ctor: WorkspacePlugin, options: {} },
  ...plugins
)
event.init(core)
onBeforeUnmount(() => {
  core?.unMounted();
});
</script>
```

### 使用 hook

```vue
<script lang="ts" setup>
import { useEditor } from '@tm2js/canvas-editor'
// 使用 editor 实例，cb 回调函数，中返回 editor 实例
useEditor((canvasEditor) => {
  canvasEditor.getPlugin('xxx')
})
</script>
```
