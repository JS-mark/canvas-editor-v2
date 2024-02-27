/*
 * @Author: Mark
 * @Date: 2024-01-16 14:59:16
 * @LastEditors: Mark
 * @LastEditTime: 2024-02-27 11:52:23
 * @Description: file content
 */

import { isObject, isString } from 'lodash-es'
import FontFaceObserver from 'fontfaceobserver'
import { useClipboard, useFileDialog, useBase64 } from '@vueuse/core'

/**
 * @description: 图片文件转字符串
 * @param {Blob|File} file 文件
 * @return {string}
 */
export function getImgStr(file: File | Blob): Promise<FileReader['result']> {
  return useBase64(file).promise.value
}

/**
 * @description: 根据json模板下载字体文件
 * @param {string} str
 * @return {Promise}
 */
export function downFontByJSON(str: string | any) {
  let data: any | null = null
  if (isString(str)) {
    data = JSON.parse(str)
  }

  if (isObject(str)) {
    data = str
  }

  /**
   * 递归遍历字体
   * @param arr
   * @returns void
   */
  const getFontFamilies = (arr: any[]) => {
    const fontFamilies: Map<string, boolean> = new Map()
    arr.map((item: any) => {
      if (['i-text', 'textbox', 'text'].includes(item.type!)) {
        fontFamilies.set(item.fontFamily!, true)
      }
      if (item.objects && item.objects.length > 0) {
        const map = getFontFamilies(item.objects)
        map.forEach((value, key) => {
          fontFamilies.set(key, value)
        })
      }
    })
    return fontFamilies
  }

  const fontMap = getFontFamilies(data.objects)
  const fontFamiliesAll = Array.from(fontMap.keys()).map((fontName) => {
    const font = new FontFaceObserver(fontName)
    return font.load('system', 15000)
  })
  return Promise.all(fontFamiliesAll)
}

/**
 * @description: 选择文件
 * @param {object} options accept = '', capture = '', multiple = false
 * @return {Promise}
 */
export function selectFiles(options: {
  accept?: string
  capture?: string
  multiple?: boolean
}): Promise<FileList | null> {
  return new Promise((resolve) => {
    const { onChange, open } = useFileDialog(options)
    onChange((files) => {
      resolve(files)
    })
    open()
  })
}

/**
 * @description: 创建图片元素
 * @param {string} str 图片地址或者base64图片
 * @return {Promise} element 图片元素
 */
export function insertImgFile(str: string) {
  return new Promise((resolve) => {
    const imgEl = document.createElement('img')
    imgEl.src = str
    // 插入页面
    document.body.appendChild(imgEl)
    imgEl.onload = () => {
      resolve(imgEl)
    }
  })
}

/**
 * Copying text to the clipboard
 * @param source Copy source
 * @param options Copy options
 * @returns Promise that resolves when the text is copied successfully, or rejects when the copy fails.
 */
export const clipboardText = async (
  source: string,
  options?: Parameters<typeof useClipboard>[0],
) => {
  try {
    await useClipboard({ source, ...options }).copy()
    console.warn('复制成功')
  }
  catch (error) {
    console.error('复制失败')
    throw error
  }
}

export const covertJSON = (json: any) => {
  json.objects = json.objects.map((item: any) => {
    item.name = item.id
    return item
  })
  return json
}
