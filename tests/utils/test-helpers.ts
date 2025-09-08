/**
 * Test utility functions for FlashCards tests
 */

/**
 * Parses translate3D values from a CSS transform string
 * @param style - The CSS style string to parse
 * @returns Object with x, y, z values or null if no match
 */
export function parseTranslate3D(style?: string): { x: number, y: number, z: number } | null {
  if (!style)
    return null

  const translate3DMatch = style.match(/translate3D\(([^,\s]+),\s*([^,\s]+),\s*([^)\s]+)\)/)
  if (!translate3DMatch)
    return null

  return {
    x: Number.parseFloat(translate3DMatch[1]),
    y: Number.parseFloat(translate3DMatch[2]),
    z: Number.parseFloat(translate3DMatch[3]),
  }
}

/**
 * Checks if a style string contains a translate3D transform with non-zero offset values
 * @param style - The CSS style string to check
 * @returns true if transform has non-zero x or y values
 */
export function hasTranslate3DOffset(style?: string): boolean {
  const parsed = parseTranslate3D(style)
  return parsed ? (parsed.x !== 0 || parsed.y !== 0) : false
}

/**
 * Checks if a style string contains a translate3D transform with positive Y value
 * @param style - The CSS style string to check
 * @returns true if transform has positive Y value
 */
export function hasPositiveYTransform(style?: string): boolean {
  const parsed = parseTranslate3D(style)
  return parsed ? parsed.y > 0 : false
}

/**
 * Checks if a style string contains a translate3D transform with negative Y value
 * @param style - The CSS style string to check
 * @returns true if transform has negative Y value
 */
export function hasNegativeYTransform(style?: string): boolean {
  const parsed = parseTranslate3D(style)
  return parsed ? parsed.y < 0 : false
}

/**
 * Checks if a style string contains a translate3D transform with negative X value
 * @param style - The CSS style string to check
 * @returns true if transform has negative X value
 */
export function hasNegativeXTransform(style?: string): boolean {
  const parsed = parseTranslate3D(style)
  return parsed ? parsed.x < 0 : false
}

/**
 * Checks if a style string contains a translate3D transform with positive X value
 * @param style - The CSS style string to check
 * @returns true if transform has positive X value
 */
export function hasPositiveXTransform(style?: string): boolean {
  const parsed = parseTranslate3D(style)
  return parsed ? parsed.x > 0 : false
}

/**
 * Parses scale value from a CSS transform string
 * @param style - The CSS style string to parse
 * @returns Scale value or null if no match
 */
export function parseScale(style?: string): number | null {
  if (!style)
    return null

  const scaleMatch = style.match(/scale\(([+-]?\d+(?:\.\d+)?)\)/)
  if (!scaleMatch)
    return null

  return Number.parseFloat(scaleMatch[1])
}

/**
 * Checks if a style string contains a scale(1) transform
 * @param style - The CSS style string to check
 * @returns true if transform has scale(1)
 */
export function hasScale1(style?: string): boolean {
  return !!style?.match(/scale\(1\)/)
}

/**
 * Checks if a style string contains any scale transform
 * @param style - The CSS style string to check
 * @returns true if transform has scale
 */
export function hasScale(style?: string): boolean {
  return !!style?.match(/scale/)
}
