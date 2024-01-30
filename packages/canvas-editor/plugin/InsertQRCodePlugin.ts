import { fabric } from 'fabric'
import { assign } from 'lodash-es'
import { Plugin } from './createPlugin'
import QRCode, { type QRCodeToDataURLOptions } from 'qrcode'

import type { Editor } from '../core'

interface GenQRCodOptions {
  x?: number
  y?: number
  width?: number
  height?: number
  radius?: number
}

export class InsertQRCodePlugin extends Plugin.BasePlugin {
  get name() {
    return 'InsertQRCodePlugin'
  }

  get events() {
    return []
  }

  get hotkeys() {
    return []
  }

  /**
   *
   */
  constructor(canvas: fabric.Canvas, editor: Editor, options: Plugin.Options) {
    super(canvas, editor, options)
  }

  /**
   * 生成二维码
   * @param text
   * @param options
   * @returns Promise<string>
   */
  async genQrCode(text: string, options: GenQRCodOptions & QRCodeToDataURLOptions = {}): Promise<string> {
    return new Promise((resolve, reject) => {
      QRCode.toDataURL(text, assign({
        type: 'image/png',
        width: 100,
        height: 100,
        scale: 6,
        errorCorrectionLevel: 'H',
        quality: 0.92,
        margin: 2,
        backgroundColor: 'transparent',
        color: {
          // dark: '#010599FF',
          // light: '#FFBF60FF',
        },
      }, options)).then((url) => {
        resolve(url)
      }).catch(err => reject(err))
    })
  }

  /**
   * 创建 qrcode 元素
   * @param text
   * @param options
   */
  genQrcodeComp(text: string, options: GenQRCodOptions & QRCodeToDataURLOptions = {}): Promise<fabric.Group | void> {
    return new Promise((resolve, reject) => {
      const options_ = assign({ width: 500, height: 500, x: 0, y: 0 }, options)
      this.genQrCode(text, options_).then((url) => {
        fabric.Image.fromURL(url, (image) => {
          if (!image)
            return
          // 设置元素大小
          image.set({
            left: 0,
            top: 0,
            width: options_.width,
            height: options_.height,
            custom: {
              type: 'qrcode',
              data: {
                text,
                options: options_,
              },
            },
          })

          const rect = new fabric.Rect({
            top: 0, // 距离画布上边的距离
            left: 0, // 距离画布左侧的距离，单位是像素
            width: options_.width, // 矩形的宽度
            height: options_.height, // 矩形的高度
            fill: '#fff', // 填充的颜色
            stroke: 'orange', // 边框原色
            strokeWidth: 0, // 边框大小
            rx: options_.radius || 24, // 圆角半径
          })

          const group = new fabric.Group([rect, image], {
            name: this.genUid(),
            originX: 'left',
            originY: 'top',
            left: options_.x || 0,
            top: options_.y || 0,
            width: options_.width,
            height: options_.height,
            objectCaching: false, // 不缓存！！！
            clipPath: rect,
            // 自定义值
            // @ts-expect-error
            custom: {
              type: 'qrcode',
              data: {
                text,
                options: options_,
              },
            },
          })

          group.scale(0.2)

          resolve(group)
        })
      }).catch(err => reject(err))
    })
  }

  async mounted() {
    console.warn(`${this.name} 插件加载成功！使用 "insertQrcode" 插入`)
  }
}
