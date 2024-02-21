/*
 * @Author: Mark
 * @Date: 2023-06-20 12:52:09
 * @LastEditors: Mark
 * @LastEditTime: 2024-02-21 20:32:38
 * @Description: 内部插件
 */
import { nanoid } from 'nanoid'
import { Plugin } from './createPlugin'
import type { fabric } from 'fabric'
import type { Editor } from '../core'
import { selectFiles, clipboardText } from '../utils/utils'
import { cloneDeep } from 'lodash-es'

function downFile(fileStr: string, fileType: string) {
  const anchorEl = document.createElement('a')
  anchorEl.href = fileStr
  anchorEl.download = `${nanoid()}.${fileType}`
  document.body.appendChild(anchorEl) // required for firefox
  anchorEl.click()
  anchorEl.remove()
}

type Comp = fabric.Group | fabric.Path | fabric.Rect | fabric.Circle | fabric.Triangle | fabric.Polygon | fabric.Text | fabric.Image | fabric.ActiveSelection | fabric.Textbox

/**
 * 只转换 objects
 * @param objects
 * @returns objects
 */
function transformObject(objects: Comp[], opt: { filterBase64: boolean } = { filterBase64: false }) {
  const base64Reg = /^data:([a-zA-Z]+\/[a-zA-Z0-9-.+]+)?(;charset=[a-zA-Z0-9-]+)?(;base64),[A-Za-z0-9+/]+={0,2}$/
  if (!objects)
    return objects
  const arr = cloneDeep(objects)
  return arr.map((item) => {
    // @ts-expect-error
    if (item.objects) {
      // @ts-expect-error
      item.objects = transformObject(item.objects, opt)
    }
    else {
      // 元素的 styles 属性
      if (['i-text', 'textbox'].includes(item.type!)) {
        (item as fabric.Textbox | fabric.IText).styles = []
      }

      if (opt.filterBase64 && item.type === 'image') {
        // @ts-expect-error
        item.src = base64Reg.test(item.src) ? '' : item.src
      }
    }
    return item
  })
}

/**
 * 转换qrcode 背景
 * @param objects
 * @param cb
 * @returns object
 */
async function transformQrcode(objects: fabric.Object[], cb: (options: any) => Promise<string>) {
  if (!objects)
    return objects

  const arr = cloneDeep(objects)
  for (const data of arr) {
    // @ts-expect-error
    if (data.objects) {
      // @ts-expect-error
      data.objects = await transformQrcode(data.objects, cb)
    }
    else {
      if (data.custom?.type === 'qrcode') {
        // @ts-expect-error
        data.src = await cb(data.custom.data)
      }
    }
  }
  return arr
}

export class ServersPlugin extends Plugin.BasePlugin {
  get name() {
    return 'ServersPlugin'
  }

  get events(): string[] {
    return []
  }

  get hotkeys(): string[] {
    return []
  }

  constructor(canvas: fabric.Canvas, editor: Editor, options: Plugin.Options) {
    super(canvas, editor, options)
  }

  render() {
    selectFiles({ accept: '.json' }).then((files) => {
      if (!files)
        return
      const [file] = files
      const reader = new FileReader()
      reader.readAsText(file, 'UTF-8')
      reader.onload = () => {
        this.renderFromJSON(reader.result as string)
      }
    })
  }

  async jsonHandlerByQrcode(json: object) {
    const plugin = this._editor.getPlugin('InsertQRCodePlugin')

    if (plugin) {
      // @ts-expect-error
      const objects = await transformQrcode(json.objects, async (options) => {
        return await plugin.genQrCode(options.text, options.options)
      })
      // @ts-expect-error
      json.objects = objects
    }
    return json
  }

  renderFromJSON(jsonFile: string | object): Promise<void> {
    if (!jsonFile) {
      throw new Error('jsonFile is empty')
    }
    // NOTE: 更新编辑器状态
    this._editor.updateStatus({
      canEdit: false,
    })
    return new Promise((resolve) => {
      // 加载前钩子
      this._editor.getHooksEntity('hookImportBefore')?.callAsync(jsonFile, async () => {
        const json = await this.jsonHandlerByQrcode(jsonFile as object)
        this._canvas.loadFromJSON(json, () => {
          this._canvas.requestRenderAll()
          // 加载后钩子
          this._editor.getHooksEntity('hookImportAfter')?.callAsync(json, () => {
            this._canvas.requestRenderAll()
            // NOTE: 更新编辑器状态
            this._editor.updateStatus({
              canEdit: true,
            })
            resolve()
          })
        })
      })
    })
  }

  getJson() {
    return this._canvas.toJSON([
      'id',
      'canRemove',
      'name',
      'custom',
      'gradientAngle',
      'selectable',
      'hasControls',
      'visible',
      'evented',
      'lockMovementX',
      'lockMovementY',
      'lockRotation',
      'lockScalingX',
      'lockScalingY',
    ])
  }

  /**
   * @description: 拖拽添加到画布
   * @param {Event} event
   * @param {object} item
   */
  dragAddItem(event: DragEvent, item: fabric.Object) {
    const { left, top } = this._canvas.getSelectionElement().getBoundingClientRect()
    if (event.x < left || event.y < top || item.width === undefined)
      return

    const point = {
      x: event.x - left,
      y: event.y - top,
    }
    const pointerVpt = this._canvas.restorePointerVpt(point)
    item.left = pointerVpt.x - item.width / 2
    item.top = pointerVpt.y
    this._canvas.add(item)
    this._canvas.requestRenderAll()
  }

  async clipboard() {
    const str = await this.toJSON()
    clipboardText(JSON.stringify(str, null, '\t'))
  }

  /**
   * 下载
   * @param type
   */
  down(type: 'json' | 'json-v2' | 'svg' | 'img') {
    switch (type) {
      case 'json-v2':
        this.toDownJSON(true).then((res) => {
          downFile(res, 'json')
        })
        break
      case 'json':
        this.toDownJSON().then((res) => {
          downFile(res, 'json')
        })
        break
      case 'svg':
        this.toSVG().then((res) => {
          downFile(res, 'svg')
        })
        break
      case 'img':
        this.toImg().then((res) => {
          downFile(res, 'png')
        })
        break
    }
  }

  /**
   * 保存纯文本
   * @param type
   * @returns Promise<string>
   */
  save(type: 'json' | 'json-v2' | 'svg' | 'img') {
    switch (type) {
      case 'json-v2':
        return this.toJSONv2()
      case 'json':
        return this.toJSON()
      case 'svg':
        return this.toSVG()
      case 'img':
        return this.toImg()
    }
  }

  async toDownJSON(isV2 = false) {
    const data = isV2 ? await this.toJSONv2() : await this.toJSON()
    return `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, '\t'),
    )}`
  }

  async toJSON() {
    const data = await this.getJson()
    // 把文本text转为textgroup，让导入可以编辑
    data.objects = transformObject(data.objects)
    return data
  }

  async toJSONv2() {
    const data = await this.getJson()
    // 把文本text转为textgroup，让导入可以编辑
    data.objects = transformObject(data.objects, { filterBase64: true })
    return data
  }

  toSVG(): Promise<string> {
    return new Promise((resolve) => {
      this._editor.getHooksEntity('hookSaveBefore')?.callAsync('', () => {
        const option = this._getSaveSvgOption()
        const dataUrl = this._canvas.toSVG(option)
        const fileStr = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(dataUrl)}`
        this._editor.getHooksEntity('hookSaveAfter')?.callAsync(fileStr, () => {
          resolve(fileStr)
        })
      })
    })
  }

  toImg(): Promise<string> {
    return new Promise((resolve) => {
      this._editor.getHooksEntity('hookSaveBefore')?.callAsync('', () => {
        const option = this._getSaveOption()
        this._canvas.setViewportTransform([1, 0, 0, 1, 0, 0])
        const dataUrl = this._canvas.toDataURL(option)
        this._editor.getHooksEntity('hookSaveAfter')?.callAsync(dataUrl, () => {
          resolve(dataUrl)
        })
      })
    })
  }

  preview() {
    return new Promise((resolve) => {
      this._editor.getHooksEntity('hookSaveBefore')?.callAsync('', () => {
        const option = this._getSaveOption()
        this._canvas.setViewportTransform([1, 0, 0, 1, 0, 0])
        this._canvas.renderAll()
        const dataUrl = this._canvas.toDataURL(option)
        this._editor.getHooksEntity('hookSaveAfter')?.callAsync(dataUrl, () => {
          resolve(dataUrl)
        })
      })
    })
  }

  private _getSaveSvgOption() {
    const workspace = this._canvas.getObjects().find((item) => {
      return item.id === 'workspace' && item.name === 'workspace'
    })
    const { left, top, width, height } = workspace!
    return {
      width,
      height,
      viewBox: {
        x: left!,
        y: top!,
        width: width!,
        height: height!,
      },
    }
  }

  _getSaveOption() {
    const workspace = this._canvas
      .getObjects()
      .find((item: fabric.Object) => {
        return item.id === 'workspace' && item.name === 'workspace'
      })
    const { left, top, width, height } = workspace as fabric.Object
    const option = {
      name: 'New Image',
      format: 'png',
      quality: 1,
      width,
      height,
      left,
      top,
    }
    return option
  }

  /**
   * 清除画布
   */
  clear() {
    this._canvas.getObjects().forEach((obj) => {
      if (obj.id !== 'workspace' && obj.name !== 'workspace') {
        this._canvas.remove(obj)
      }
    })
    this._canvas.discardActiveObject()
    this._canvas.renderAll()
  }

  async mounted() {
    this._editor.emit(`${this.name}:mounted`)
  }
}
