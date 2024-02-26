/*
 * @Author: Mark
 * @Date: 2023-06-27 22:58:57
 * @LastEditors: Mark
 * @LastEditTime: 2024-02-22 20:49:58
 * @Description: 下载字体插件
 */

import { downFontByJSON } from '../utils/utils'
import type { fabric } from 'fabric'
import type { Editor } from '../core'
import { Plugin } from './createPlugin'

export class DownFontPlugin extends Plugin.BasePlugin {
  get name() {
    return 'DownFontPlugin'
  }

  get events() {
    return []
  }

  get hotkeys(): string[] {
    return []
  }

  constructor(canvas: fabric.Canvas, editor: Editor, options: Plugin.Options) {
    super(canvas, editor, options)
  }

  hookImportBefore(json: any) {
    return downFontByJSON(json)
  }

  async mounted() {
    this._editor.emit(`${this.name}:mounted`)
  }
}
