# 插件

## 开发插件

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
  async mounted() {
    this._editor.emit(`${this.name}:mounted`)
  }
  async destroyed() {}
}
```
