/// <reference types="vite/client" />

declare namespace fabric {
  export interface Validate {
    trigger: 'blur' | 'change' | 'submit'
    mode: 'required' | 'pattern' | 'min' | 'max' | 'len'
    message: string
    required?: boolean
    pattern?: RegExp
    min?: number
    max?: number
    type: 'string' | 'array'
  }

  export interface ObjectScheme {
    type: string
    label: string // 表单 label
    required: boolean | string // 是否必填, 默认为 false
    placeholder: string // 占位符
    message: string // 提示信息
    attribute?: string // 更新的 object 属性
    validate: Validate[]
    options?: any // qrcode 会使用此
  }

  export interface ObjectCustom {
    type: 'image' | 'text' | 'qrcode' | 'switch' | 'workspace' | string
    data?: object
    schemes?: ObjectScheme[]
  }

  export interface Arrow {}

  export interface Canvas {
    contextTop: CanvasRenderingContext2D
    lowerCanvasEl: HTMLElement
    _currentTransform: unknown
    _centerObject: (obj: fabric.Object, center: fabric.Point) => fabric.Canvas
  }

  export interface Object {
    id: string
    custom: ObjectCustom
    // 是否可以删除
    canRemove: boolean
    getWidthHeight: (noFixed?: boolean) => fabric.Point
  }

  export interface Control {
    rotate: number
  }

  function ControlMouseEventHandler(
    eventData: MouseEvent,
    transformData: Transform,
    x: number,
    y: number
  ): boolean

  function ControlStringHandler(
    eventData: MouseEvent,
    control: fabric.Control,
    fabricObject: fabric.Object
  ): string

  export const controlsUtils: {
    rotationWithSnapping: ControlMouseEventHandler
    scalingEqually: ControlMouseEventHandler
    scalingYOrSkewingX: ControlMouseEventHandler
    scalingXOrSkewingY: ControlMouseEventHandler

    scaleCursorStyleHandler: ControlStringHandler
    scaleSkewCursorStyleHandler: ControlStringHandler
    scaleOrSkewActionName: ControlStringHandler
    rotationStyleHandler: ControlStringHandler
  }
}
