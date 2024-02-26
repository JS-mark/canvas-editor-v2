<script setup lang="ts">
import { fabric } from 'fabric'
import { useCanvasEditor } from './plugins/canvas-editor'
// 创建fabric canvas实例
const canvas = new fabric.Canvas('canvas', {
  width: 800,
  height: 600,
  backgroundColor: '#f5f5f5'
})
// 初始化编辑器
useCanvasEditor(canvas, [])
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
