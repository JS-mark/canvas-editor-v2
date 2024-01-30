<script setup lang="ts">
import { fabric } from 'fabric'
import { createCore, WorkspacePlugin } from '@tm2js/canvas-editor'
import '@tm2js/canvas-editor/dist/index.css'

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

<template>
  <div class="container">
    <canvas id="canvas"></canvas>
  </div>
</template>

<style scoped>
.container {
  width: 100vw;
  height: 100vh;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
