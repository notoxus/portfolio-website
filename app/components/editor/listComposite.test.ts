import { describe, it, expect } from 'vitest'
import {
  normalizeBulletListMarker,
  DEFAULT_BULLET_LIST_MARKER,
} from './listComposite'

describe('normalizeBulletListMarker', () => {
  it.each(['-', '+', '*'] as const)('passes through valid marker %s', (marker) => {
    expect(normalizeBulletListMarker(marker)).toBe(marker)
  })

  it('falls back to the default for anything else', () => {
    expect(normalizeBulletListMarker('x')).toBe(DEFAULT_BULLET_LIST_MARKER)
    expect(normalizeBulletListMarker(undefined)).toBe(DEFAULT_BULLET_LIST_MARKER)
    expect(normalizeBulletListMarker(42)).toBe(DEFAULT_BULLET_LIST_MARKER)
  })
})