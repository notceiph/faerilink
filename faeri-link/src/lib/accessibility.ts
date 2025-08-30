// Accessibility utilities and helpers for WCAG 2.1 AA compliance

// Screen reader utilities
export const srOnly = {
  className: 'sr-only',
  style: {
    position: 'absolute' as const,
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap' as const,
    border: '0',
  },
}

// Focus management utilities
export const focusUtils = {
  // Trap focus within a container
  trapFocus: (container: HTMLElement, event: KeyboardEvent) => {
    const focusableElements = container.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )

    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    if (event.key === 'Tab') {
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    }
  },

  // Focus the first focusable element in a container
  focusFirst: (container: HTMLElement) => {
    const firstElement = container.querySelector(
      'a[href], button:not([disabled]), textarea, input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement

    if (firstElement) {
      firstElement.focus()
    }
  },

  // Return focus to the previously focused element
  returnFocus: (previousElement?: HTMLElement) => {
    if (previousElement && previousElement.focus) {
      previousElement.focus()
    } else {
      // Focus the body if no previous element
      document.body.focus()
    }
  },

  // Check if element is focusable
  isFocusable: (element: HTMLElement): boolean => {
    return element.matches(
      'a[href], button:not([disabled]), textarea, input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  },
}

// ARIA utilities
export const ariaUtils = {
  // Generate unique IDs for ARIA relationships
  generateId: (prefix: string = 'aria') => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
  },

  // Create ARIA live region for announcements
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.style.position = 'absolute'
    announcement.style.left = '-10000px'
    announcement.style.width = '1px'
    announcement.style.height = '1px'
    announcement.style.overflow = 'hidden'

    document.body.appendChild(announcement)
    announcement.textContent = message

    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  },

  // Manage ARIA expanded state
  setExpanded: (element: HTMLElement, expanded: boolean) => {
    element.setAttribute('aria-expanded', expanded.toString())
  },

  // Manage ARIA hidden state
  setHidden: (element: HTMLElement, hidden: boolean) => {
    element.setAttribute('aria-hidden', hidden.toString())
  },
}

// Color contrast utilities
export const colorUtils = {
  // Calculate relative luminance
  getLuminance: (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  },

  // Calculate contrast ratio
  getContrastRatio: (color1: string, color2: string): number => {
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : null
    }

    const rgb1 = hexToRgb(color1)
    const rgb2 = hexToRgb(color2)

    if (!rgb1 || !rgb2) return 1

    const l1 = colorUtils.getLuminance(rgb1.r, rgb1.g, rgb1.b)
    const l2 = colorUtils.getLuminance(rgb2.r, rgb2.g, rgb2.b)

    const lighter = Math.max(l1, l2)
    const darker = Math.min(l1, l2)

    return (lighter + 0.05) / (darker + 0.05)
  },

  // Check if contrast meets WCAG AA standards
  meetsAAContrast: (ratio: number, isLargeText: boolean = false): boolean => {
    return isLargeText ? ratio >= 3 : ratio >= 4.5
  },

  // Check if contrast meets WCAG AAA standards
  meetsAAAContrast: (ratio: number, isLargeText: boolean = false): boolean => {
    return isLargeText ? ratio >= 4.5 : ratio >= 7
  },
}

// Keyboard navigation utilities
export const keyboardUtils = {
  // Handle keyboard navigation for custom components
  handleKeyDown: (
    event: React.KeyboardEvent,
    handlers: {
      onEnter?: () => void
      onEscape?: () => void
      onArrowUp?: () => void
      onArrowDown?: () => void
      onArrowLeft?: () => void
      onArrowRight?: () => void
      onSpace?: () => void
      onTab?: () => void
    }
  ) => {
    switch (event.key) {
      case 'Enter':
        handlers.onEnter?.()
        break
      case 'Escape':
        handlers.onEscape?.()
        break
      case 'ArrowUp':
        event.preventDefault()
        handlers.onArrowUp?.()
        break
      case 'ArrowDown':
        event.preventDefault()
        handlers.onArrowDown?.()
        break
      case 'ArrowLeft':
        event.preventDefault()
        handlers.onArrowLeft?.()
        break
      case 'ArrowRight':
        event.preventDefault()
        handlers.onArrowRight?.()
        break
      case ' ':
        event.preventDefault()
        handlers.onSpace?.()
        break
      case 'Tab':
        handlers.onTab?.()
        break
    }
  },

  // Skip link functionality
  skipToContent: (targetId: string) => {
    const target = document.getElementById(targetId)
    if (target) {
      target.focus()
      target.scrollIntoView({ behavior: 'smooth' })
    }
  },
}

// Motion and animation preferences
export const motionUtils = {
  // Check if user prefers reduced motion
  prefersReducedMotion: (): boolean => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  },

  // Get appropriate animation duration
  getAnimationDuration: (baseDuration: number): number => {
    return motionUtils.prefersReducedMotion() ? 0 : baseDuration
  },

  // Create motion-safe animation
  createMotionSafeAnimation: (
    keyframes: Keyframe[],
    options: KeyframeAnimationOptions
  ) => {
    if (motionUtils.prefersReducedMotion()) {
      return null
    }
    return keyframes
  },
}

// Form accessibility utilities
export const formUtils = {
  // Associate labels with inputs
  generateFieldId: (fieldName: string, formId?: string): string => {
    return `${formId || 'form'}-${fieldName}`
  },

  // Validate form field
  validateField: (
    value: string,
    rules: {
      required?: boolean
      minLength?: number
      maxLength?: number
      pattern?: RegExp
      email?: boolean
    }
  ): string[] => {
    const errors: string[] = []

    if (rules.required && !value.trim()) {
      errors.push('This field is required')
    }

    if (value && rules.minLength && value.length < rules.minLength) {
      errors.push(`Must be at least ${rules.minLength} characters`)
    }

    if (value && rules.maxLength && value.length > rules.maxLength) {
      errors.push(`Must be no more than ${rules.maxLength} characters`)
    }

    if (value && rules.pattern && !rules.pattern.test(value)) {
      errors.push('Invalid format')
    }

    if (value && rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors.push('Please enter a valid email address')
    }

    return errors
  },

  // Announce form validation errors
  announceValidationErrors: (errors: Record<string, string[]>) => {
    const errorCount = Object.values(errors).flat().length
    if (errorCount > 0) {
      ariaUtils.announce(
        `Form has ${errorCount} error${errorCount === 1 ? '' : 's'}. ${Object.values(errors).flat().join('. ')}`,
        'assertive'
      )
    }
  },
}

// Skip link component data
export const skipLinks = {
  main: { id: 'main-content', label: 'Skip to main content' },
  navigation: { id: 'main-navigation', label: 'Skip to navigation' },
  search: { id: 'search', label: 'Skip to search' },
}

// Export all utilities
export const accessibility = {
  srOnly,
  focusUtils,
  ariaUtils,
  colorUtils,
  keyboardUtils,
  motionUtils,
  formUtils,
  skipLinks,
}

export default accessibility
