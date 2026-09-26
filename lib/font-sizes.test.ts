import { describe, it, expect } from 'vitest'
import { normalizeFontSize, FONT_SIZE_MIN, FONT_SIZE_MAX } from './font-sizes'

describe('normalizeFontSize', () => {
  it('migrates legacy string sizes', () => {
    expect(normalizeFontSize('lg', 14)).toBe(18)
  })
  it('clamps below minimum', () => {
    expect(normalizeFontSize(2, 14)).toBe(FONT_SIZE_MIN)
  })
  it('clamps above maximum', () => {
    expect(normalizeFontSize(999, 14)).toBe(FONT_SIZE_MAX)
  })
  it('falls back on garbage input', () => {
    expect(normalizeFontSize('not-a-size', 14)).toBe(14)
  })
})