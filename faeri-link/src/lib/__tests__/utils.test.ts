import {
  cn,
  generateId,
  generateSlug,
  isValidEmail,
  isValidUrl,
  isValidSlug,
  formatDate,
  formatRelativeTime,
  truncateText,
  capitalize,
  sleep,
} from '../utils'

describe('Utility Functions', () => {
  describe('cn', () => {
    it('merges class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
      expect(cn('class1', undefined, 'class2')).toBe('class1 class2')
      expect(cn('class1', null, 'class2')).toBe('class1 class2')
    })

    it('handles conditional classes', () => {
      expect(cn('class1', true && 'class2', false && 'class3')).toBe('class1 class2')
    })
  })

  describe('generateId', () => {
    it('generates a string', () => {
      const id = generateId()
      expect(typeof id).toBe('string')
      expect(id.length).toBeGreaterThan(0)
    })

    it('generates unique IDs', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
    })
  })

  describe('generateSlug', () => {
    it('converts text to URL slug', () => {
      expect(generateSlug('Hello World')).toBe('hello-world')
      expect(generateSlug('Test & Example')).toBe('test-example')
      expect(generateSlug('Multiple   Spaces')).toBe('multiple-spaces')
    })

    it('handles special characters', () => {
      expect(generateSlug('Hello@World!')).toBe('helloworld')
      expect(generateSlug('Test (123)')).toBe('test-123')
    })

    it('limits length', () => {
      const longText = 'a'.repeat(100)
      const slug = generateSlug(longText)
      expect(slug.length).toBeLessThanOrEqual(50)
    })
  })

  describe('isValidEmail', () => {
    it('validates email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
    })
  })

  describe('isValidUrl', () => {
    it('validates URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true)
      expect(isValidUrl('http://example.com')).toBe(true)
      expect(isValidUrl('invalid-url')).toBe(false)
      expect(isValidUrl('')).toBe(false)
    })
  })

  describe('isValidSlug', () => {
    it('validates URL slugs', () => {
      expect(isValidSlug('valid-slug')).toBe(true)
      expect(isValidSlug('valid-slug-123')).toBe(true)
      expect(isValidSlug('invalid slug')).toBe(false)
      expect(isValidSlug('invalid@slug')).toBe(false)
      expect(isValidSlug('ab')).toBe(false) // too short
      expect(isValidSlug('a'.repeat(51))).toBe(false) // too long
    })
  })

  describe('formatDate', () => {
    it('formats dates correctly', () => {
      const date = new Date('2024-01-15')
      const formatted = formatDate(date)
      expect(formatted).toMatch(/\w+ \d+, \d{4}/)
    })

    it('handles string dates', () => {
      const formatted = formatDate('2024-01-15')
      expect(formatted).toMatch(/\w+ \d+, \d{4}/)
    })
  })

  describe('formatRelativeTime', () => {
    it('formats relative time correctly', () => {
      const now = new Date()
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1000)
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

      expect(formatRelativeTime(oneMinuteAgo)).toBe('just now')
      expect(formatRelativeTime(oneHourAgo)).toContain('hours ago')
      expect(formatRelativeTime(oneDayAgo)).toContain('days ago')
    })
  })

  describe('truncateText', () => {
    it('truncates text correctly', () => {
      expect(truncateText('Hello World', 5)).toBe('Hello...')
      expect(truncateText('Hello', 10)).toBe('Hello')
      expect(truncateText('', 5)).toBe('')
    })
  })

  describe('capitalize', () => {
    it('capitalizes strings correctly', () => {
      expect(capitalize('hello')).toBe('Hello')
      expect(capitalize('HELLO')).toBe('Hello')
      expect(capitalize('')).toBe('')
      expect(capitalize('hELLO')).toBe('Hello')
    })
  })

  describe('sleep', () => {
    it('delays execution', async () => {
      const start = Date.now()
      await sleep(100)
      const end = Date.now()
      expect(end - start).toBeGreaterThanOrEqual(95)
    })
  })
})
