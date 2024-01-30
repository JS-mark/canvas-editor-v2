import type { Editor } from '../core'
import { Plugin } from './createPlugin'

import { AlignGuidelines } from 'fabric-guideline-plugin'

export class GuidelinesPlugin extends Plugin.BasePlugin {
  get name() {
    return 'GuidelinesPlugin'
  }

  get hotkeys(): string[] {
    return []
  }

  get events(): string[] {
    return []
  }

  private alignGuidelines: AlignGuidelines | null = null

  constructor(canvas: fabric.Canvas, editor: Editor, options: Plugin.Options) {
    super(canvas, editor, options)
    this.init()
  }

  init() {
    this.alignGuidelines = new AlignGuidelines({
      canvas: this._canvas,
      aligningOptions: {
        lineColor: 'rgba(254, 53, 14, 1)',
        lineWidth: 1,
        lineMargin: 0,
      },
    })

    this.alignGuidelines.init()
  }

  getalignGuidelines() {
    return this.alignGuidelines
  }
}
