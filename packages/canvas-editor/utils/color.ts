/**
 * css 转 fabric 渐变
 * @param handlers
 * @param width
 * @param height
 * @param type
 * @param angle
 * @returns fabric.Gradient
 */
export const generateFabricGradientFromColorStops = (
  handlers: { offset: number, color: string }[],
  width: number,
  height: number,
  type: 'linear' | 'radial',
  angle: number,
) => {
  // 角度转换坐标
  const gradAngleToCoords = (paramsAngle: number | string) => {
    const anglePI = -parseInt(paramsAngle as string, 10) * (Math.PI / 180)
    return {
      x1: Math.round(50 + Math.sin(anglePI) * 50) / 100,
      y1: Math.round(50 + Math.cos(anglePI) * 50) / 100,
      x2: Math.round(50 + Math.sin(anglePI + Math.PI) * 50) / 100,
      y2: Math.round(50 + Math.cos(anglePI + Math.PI) * 50) / 100,
    }
  }

  // 生成线性渐变
  const generateLinear = (colorStops: { offset: number, color: string }[]) => {
    const angleCoords = gradAngleToCoords(angle)
    return new fabric.Gradient({
      type: 'linear',
      coords: {
        x1: angleCoords.x1 * width,
        y1: angleCoords.y1 * height,
        x2: angleCoords.x2 * width,
        y2: angleCoords.y2 * height,
      },
      colorStops,
    })
  }

  // 生成径向渐变
  const generateRadial = (colorStops: { offset: number, color: string }[]) => {
    return new fabric.Gradient({
      type: 'radial',
      coords: {
        x1: width / 2,
        y1: height / 2,
        r1: 0,
        x2: width / 2,
        y2: height / 2,
        r2: width / 2,
      },
      colorStops,
    })
  }

  let bgGradient: fabric.Gradient | null = null
  const colorStops = [...handlers]
  if (type === 'linear') {
    bgGradient = generateLinear(colorStops)
  }
  else if (type === 'radial') {
    bgGradient = generateRadial(colorStops)
  }

  return bgGradient
}

interface RGBAColor {
  r: number
  g: number
  b: number
  a: number
}

interface GradientColor {
  color: RGBAColor
  position?: string
}

interface CSSGradient {
  type: 'linear-gradient' | 'radial-gradient'
  shapeAndPosition?: string
  colors: GradientColor[]
}

/**
 * 颜色转换
 * @param colorString
 * @returns RGBAColor
 */
export function parseColor(colorString: string): RGBAColor | null {
  if (colorString.startsWith('rgba')) {
    const rgba = colorString.match(/\d+\.?\d*/g)?.map(Number)
    if (rgba && rgba.length === 4) {
      return { r: rgba[0], g: rgba[1], b: rgba[2], a: rgba[3] }
    }
  }
  else if (colorString.startsWith('rgb')) {
    const rgb = colorString.match(/\d+\.?\d*/g)?.map(Number)
    if (rgb && rgb.length === 3) {
      return { r: rgb[0], g: rgb[1], b: rgb[2], a: 1 }
    }
  }
  else if (colorString.startsWith('#')) {
    return parseHexColor(colorString)
  }
  return null
}

/**
 * 十六进制颜色 转换成 rgba
 * @param hex
 * @returns RGBAColor
 */
function parseHexColor(hex: string): RGBAColor | null {
  let r = 0
  let g = 0
  let b = 0
  let a = 1
  hex = hex.substring(1)

  if (hex.length === 3) {
    r = parseInt(hex.charAt(0) + hex.charAt(0), 16)
    g = parseInt(hex.charAt(1) + hex.charAt(1), 16)
    b = parseInt(hex.charAt(2) + hex.charAt(2), 16)
  }
  else if (hex.length === 4) {
    r = parseInt(hex.charAt(0) + hex.charAt(0), 16)
    g = parseInt(hex.charAt(1) + hex.charAt(1), 16)
    b = parseInt(hex.charAt(2) + hex.charAt(2), 16)
    a = parseInt(hex.charAt(3) + hex.charAt(3), 16) / 255
  }
  else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16)
    g = parseInt(hex.substring(2, 4), 16)
    b = parseInt(hex.substring(4, 6), 16)
  }
  else if (hex.length === 8) {
    r = parseInt(hex.substring(0, 2), 16)
    g = parseInt(hex.substring(2, 4), 16)
    b = parseInt(hex.substring(4, 6), 16)
    a = parseInt(hex.substring(6, 8), 16) / 255
  }
  else {
    console.error('Invalid hex color format')
    return null
  }

  return { r, g, b, a }
}

/**
 * 渐变颜色转换成对象
 * @param input
 * @returns CSSGradient
 */
export function parseCSSGradient(input: string): CSSGradient | null {
  const gradientPattern = /^(linear-gradient|radial-gradient)\((.+)\)$/
  const match = input.match(gradientPattern)

  if (!match || match.length < 3) {
    console.error('Invalid gradient format')
    return null
  }

  const type = match[1] as 'linear-gradient' | 'radial-gradient'
  const mainPart = match[2]
  let shapeAndPosition: string | undefined
  let colorsPart: string

  if (type === 'linear-gradient') {
    const linearParts = mainPart.split(/,(?=\s*rgba?\()/)
    shapeAndPosition = linearParts.shift()?.trim()
    colorsPart = linearParts.join(',')
  }
  else if (type === 'radial-gradient') {
    const radialParts = mainPart.split(/,(?=\s*rgba?\()/)
    if (radialParts[0].includes('at')) {
      shapeAndPosition = radialParts.shift()?.trim()
    }
    colorsPart = radialParts.join(',')
  }
  else {
    console.error('Unsupported gradient type')
    return null
  }

  const colorPattern
    = /(rgba?\(\d+\s*,\s*\d+\s*,\s*\d+\s*,?\s*\d*\.?\d+\)|#\w{3,8})\s*(\d+%|closest-side|farthest-side|closest-corner|farthest-corner)?/g
  const colors: GradientColor[] = []
  let colorMatch
  // eslint-disable-next-line no-cond-assign
  while ((colorMatch = colorPattern.exec(colorsPart)) !== null) {
    const rgba = parseColor(colorMatch[1])
    if (rgba) {
      colors.push({ color: rgba, position: colorMatch[2]?.trim() || undefined })
    }
    else {
      console.error('Invalid color value: ' + colorMatch[1])
      return null
    }
  }

  return {
    type,
    shapeAndPosition,
    colors,
  }
}
