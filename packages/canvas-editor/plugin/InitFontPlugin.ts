/*
 * @Author: Mark
 * @Date: 2023-05-21 08:55:25
 * @LastEditors: Mark
 * @LastEditTime: 2025-09-02 18:18:00
 * @Description: 初始化字体插件
 */

import type { Editor } from '../core'

import { fabric } from 'fabric'
import { Plugin } from './createPlugin'
import { FontList, setFontsStyle, allFonts } from 'utils'
import { isEmpty } from 'lodash-es'


export class InitFontPlugin extends Plugin.BasePlugin {
  get name() {
    return 'InitFontPlugin'
  }

  get hotkeys(): string[] {
    return []
  }

  get events(): string[] {
    return []
  }

  get fonts() {
    return this._options.fonts
  }

  constructor(canvas: fabric.Canvas, editor: Editor, options: Plugin.Options & {
    fonts?: FontList[]
  }) {
    super(canvas, editor, options)
    this.init()
  }

  private init() {
    const list = isEmpty(this._options.fonts) ? allFonts : this._options.fonts as FontList[]
    setFontsStyle(list)
  }

  async mounted() {
    this._editor.emit(`${this.name}:mounted`)
  }
}
