// Jest setup file for configuring the testing environment
import '@testing-library/jest-dom'

// Mock Next.js router
import { jest } from '@jest/globals'

jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock environment variables
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

// Mock Supabase
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(),
      })),
    })),
    auth: {
      getUser: jest.fn(),
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        remove: jest.fn(),
        getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'test-url' } })),
        list: jest.fn(() => ({ data: [] })),
      })),
    },
  },
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
})) as any

// Mock ResizeObserver
global.ResizeObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
})) as any

// Mock Performance API
const mockPerformance = {
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByName: jest.fn(() => []),
  getEntriesByType: jest.fn(() => []),
  now: jest.fn(() => 0),
}

Object.defineProperty(window, 'performance', {
  writable: true,
  value: mockPerformance,
})

// Mock PerformanceObserver
global.PerformanceObserver = jest.fn(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
})) as any

// Mock crypto for security tests
Object.defineProperty(global.self, 'crypto', {
  value: {
    randomBytes: jest.fn(() => Buffer.from('test-random-bytes')),
    createHash: jest.fn(() => ({
      update: jest.fn(() => ({
        digest: jest.fn(() => 'hashed-value'),
      })),
    })),
    createHmac: jest.fn(() => ({
      update: jest.fn(() => ({
        digest: jest.fn(() => 'hmac-value'),
      })),
    })),
    createCipher: jest.fn(() => ({
      update: jest.fn(() => 'encrypted'),
      final: jest.fn(() => ''),
      getAuthTag: jest.fn(() => Buffer.from('auth-tag')),
    })),
    createDecipher: jest.fn(() => ({
      setAuthTag: jest.fn(() => ({
        update: jest.fn(() => 'decrypted'),
        final: jest.fn(() => ''),
      })),
    })),
  },
})

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
})

// Mock navigator.vibrate for accessibility tests
Object.defineProperty(window.navigator, 'vibrate', {
  value: jest.fn(),
})

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks()
})
