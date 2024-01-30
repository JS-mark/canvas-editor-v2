import NP from 'number-precision'

/**
 * 获取多边形顶点坐标
 * @param edges 变数
 * @param radius 半径
 * @returns 坐标数组
 */
export const getPolygonVertices = (edges: number, radius: number) => {
  const vertices = []
  const interiorAngle = (Math.PI * 2) / edges
  let rotationAdjustment = -Math.PI / 2
  if (edges % 2 === 0) {
    rotationAdjustment += interiorAngle / 2
  }
  for (let i = 0; i < edges; i++) {
    // 画圆取顶点坐标
    const rad = i * interiorAngle + rotationAdjustment
    vertices.push({
      x: Math.cos(rad) * radius,
      y: Math.sin(rad) * radius,
    })
  }
  return vertices
}


/**
 * Clamps the given 'angle' between '-180' and '180'
 * @param angle
 * @returns The clamped angle
 */
export const clampAngle = (angle: number): number => {
  const normalizedAngle = ((angle % 360) + 360) % 360
  const clampedAngle = normalizedAngle > 180 ? normalizedAngle - 360 : normalizedAngle
  return clampedAngle
}

/**
 * Rounds a number to a specified number of decimal places.
 * @param {number} v - The number to round.
 * @param {number} [digits] - The number of decimal places to round to. Default is 2.
 * @returns {number} - The rounded number.
 */
export const toFixed = (v: number, digits = 2): number => NP.round(v, digits)
