import {
  colorUtils,
  formUtils,
  keyboardUtils,
  motionUtils,
  inputSecurity,
  ariaUtils,
} from '../accessibility'

describe('Accessibility Utilities', () => {
  describe('Color Utilities', () => {
    describe('getLuminance', () => {
      it('calculates luminance correctly', () => {
        // White
        expect(colorUtils.getLuminance(255, 255, 255)).toBeCloseTo(1, 2)
        // Black
        expect(colorUtils.getLuminance(0, 0, 0)).toBe(0)
        // Red
        expect(colorUtils.getLuminance(255, 0, 0)).toBeCloseTo(0.2126, 2)
      })
    })

    describe('getContrastRatio', () => {
      it('calculates contrast ratio correctly', () => {
        const white = '#ffffff'
        const black = '#000000'
        const ratio = colorUtils.getContrastRatio(white, black)
        expect(ratio).toBeGreaterThan(20) // Should be very high contrast
      })

      it('handles invalid colors', () => {
        const ratio = colorUtils.getContrastRatio('invalid', '#000000')
        expect(ratio).toBe(1) // Default fallback
      })
    })

    describe('meetsAAContrast', () => {
      it('validates AA contrast compliance', () => {
        expect(colorUtils.meetsAAContrast(4.5)).toBe(true)
        expect(colorUtils.meetsAAContrast(4.4)).toBe(false)
        expect(colorUtils.meetsAAContrast(3.1, true)).toBe(true) // Large text
        expect(colorUtils.meetsAAContrast(3.0, true)).toBe(false) // Large text
      })
    })

    describe('meetsAAAContrast', () => {
      it('validates AAA contrast compliance', () => {
        expect(colorUtils.meetsAAAContrast(7)).toBe(true)
        expect(colorUtils.meetsAAAContrast(6.9)).toBe(false)
        expect(colorUtils.meetsAAAContrast(4.6, true)).toBe(true) // Large text
        expect(colorUtils.meetsAAAContrast(4.5, true)).toBe(false) // Large text
      })
    })
  })

  describe('Form Utilities', () => {
    describe('generateFieldId', () => {
      it('generates field IDs', () => {
        expect(formUtils.generateFieldId('email')).toBe('form-email')
        expect(formUtils.generateFieldId('name', 'user')).toBe('user-name')
      })
    })

    describe('validateField', () => {
      it('validates required fields', () => {
        const errors = formUtils.validateField('', { required: true })
        expect(errors).toContain('This field is required')
      })

      it('validates minimum length', () => {
        const errors = formUtils.validateField('hi', { minLength: 5 })
        expect(errors).toContain('Must be at least 5 characters')
      })

      it('validates maximum length', () => {
        const errors = formUtils.validateField('a'.repeat(11), { maxLength: 10 })
        expect(errors).toContain('Must be no more than 10 characters')
      })

      it('validates email format', () => {
        const errors = formUtils.validateField('invalid-email', { email: true })
        expect(errors).toContain('Please enter a valid email address')
      })

      it('validates patterns', () => {
        const errors = formUtils.validateField('123abc', { pattern: /^[0-9]+$/ })
        expect(errors).toContain('Invalid format')
      })
    })
  })

  describe('Input Security', () => {
    describe('sanitizeString', () => {
      it('removes script tags', () => {
        const input = '<script>alert("xss")</script>Hello'
        expect(inputSecurity.sanitizeString(input)).toBe('Hello')
      })

      it('removes HTML tags', () => {
        const input = '<p>Hello <strong>World</strong></p>'
        expect(inputSecurity.sanitizeString(input)).toBe('Hello World')
      })

      it('trims whitespace', () => {
        expect(inputSecurity.sanitizeString('  hello  ')).toBe('hello')
      })
    })

    describe('validateEmail', () => {
      it('validates email addresses', () => {
        expect(inputSecurity.validateEmail('test@example.com')).toBe(true)
        expect(inputSecurity.validateEmail('invalid-email')).toBe(false)
        expect(inputSecurity.validateEmail('')).toBe(false)
        expect(inputSecurity.validateEmail('a'.repeat(250) + '@example.com')).toBe(false)
      })
    })

    describe('validateUsername', () => {
      it('validates usernames', () => {
        expect(inputSecurity.validateUsername('validuser123')).toBe(true)
        expect(inputSecurity.validateUsername('invalid user')).toBe(false)
        expect(inputSecurity.validateUsername('user@domain')).toBe(false)
        expect(inputSecurity.validateUsername('ab')).toBe(false)
        expect(inputSecurity.validateUsername('a'.repeat(31))).toBe(false)
      })
    })

    describe('validateUrl', () => {
      it('validates URLs', () => {
        expect(inputSecurity.validateUrl('https://example.com')).toBe(true)
        expect(inputSecurity.validateUrl('http://example.com')).toBe(true)
        expect(inputSecurity.validateUrl('ftp://example.com')).toBe(false)
        expect(inputSecurity.validateUrl('not-a-url')).toBe(false)
      })
    })
  })

  describe('Motion Utils', () => {
    describe('prefersReducedMotion', () => {
      it('returns boolean value', () => {
        const result = motionUtils.prefersReducedMotion()
        expect(typeof result).toBe('boolean')
      })
    })

    describe('getAnimationDuration', () => {
      it('returns zero for reduced motion', () => {
        // Mock reduced motion preference
        const originalMatchMedia = window.matchMedia
        window.matchMedia = jest.fn().mockImplementation(() => ({
          matches: true,
        }))

        expect(motionUtils.getAnimationDuration(300)).toBe(0)

        // Restore original
        window.matchMedia = originalMatchMedia
      })

      it('returns normal duration without reduced motion', () => {
        // Mock no reduced motion preference
        const originalMatchMedia = window.matchMedia
        window.matchMedia = jest.fn().mockImplementation(() => ({
          matches: false,
        }))

        expect(motionUtils.getAnimationDuration(300)).toBe(300)

        // Restore original
        window.matchMedia = originalMatchMedia
      })
    })
  })

  describe('ARIA Utils', () => {
    describe('generateId', () => {
      it('generates unique IDs', () => {
        const id1 = ariaUtils.generateId()
        const id2 = ariaUtils.generateId()
        expect(id1).not.toBe(id2)
        expect(id1).toMatch(/^aria-[a-z0-9]+$/)
      })

      it('uses custom prefix', () => {
        const id = ariaUtils.generateId('custom')
        expect(id).toMatch(/^custom-[a-z0-9]+$/)
      })
    })

    describe('announce', () => {
      it('creates announcement element', () => {
        const originalQuerySelector = document.querySelector
        const mockElement = {
          setAttribute: jest.fn(),
          textContent: '',
        }

        document.querySelector = jest.fn().mockReturnValue(mockElement)
        document.body.appendChild = jest.fn()
        document.body.removeChild = jest.fn()

        ariaUtils.announce('Test message')

        expect(document.body.appendChild).toHaveBeenCalled()
        expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-live', 'polite')
        expect(mockElement.textContent).toBe('Test message')

        // Restore original
        document.querySelector = originalQuerySelector
      })
    })
  })

  describe('Keyboard Utils', () => {
    describe('handleKeyDown', () => {
      it('calls handlers for different keys', () => {
        const handlers = {
          onEnter: jest.fn(),
          onEscape: jest.fn(),
          onSpace: jest.fn(),
          onArrowUp: jest.fn(),
        }

        const mockEvent = {
          key: 'Enter',
          preventDefault: jest.fn(),
        } as any

        keyboardUtils.handleKeyDown(mockEvent, handlers)
        expect(handlers.onEnter).toHaveBeenCalled()

        mockEvent.key = 'Escape'
        keyboardUtils.handleKeyDown(mockEvent, handlers)
        expect(handlers.onEscape).toHaveBeenCalled()

        mockEvent.key = ' '
        keyboardUtils.handleKeyDown(mockEvent, handlers)
        expect(handlers.onSpace).toHaveBeenCalled()
        expect(mockEvent.preventDefault).toHaveBeenCalled()

        mockEvent.key = 'ArrowUp'
        mockEvent.preventDefault.mockClear()
        keyboardUtils.handleKeyDown(mockEvent, handlers)
        expect(handlers.onArrowUp).toHaveBeenCalled()
        expect(mockEvent.preventDefault).toHaveBeenCalled()
      })
    })
  })
})
