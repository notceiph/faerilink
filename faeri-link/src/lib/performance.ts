// Performance monitoring and optimization utilities
import { useEffect, useState } from 'react'

// Web Vitals tracking
export interface WebVitalsMetrics {
  cls: number | null
  fid: number | null
  lcp: number | null
  fcp: number | null
  ttfb: number | null
}

class PerformanceMonitor {
  private metrics: WebVitalsMetrics = {
    cls: null,
    fid: null,
    lcp: null,
    fcp: null,
    ttfb: null,
  }

  private observers: PerformanceObserver[] = []

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers()
    }
  }

  private initializeObservers() {
    // Largest Contentful Paint (LCP)
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
          size: number
        }

        this.metrics.lcp = lastEntry.startTime
        this.reportMetric('LCP', lastEntry.startTime)
      })

      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      this.observers.push(lcpObserver)
    } catch (error) {
      console.warn('LCP observation not supported')
    }

    // First Contentful Paint (FCP)
    try {
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]

        this.metrics.fcp = lastEntry.startTime
        this.reportMetric('FCP', lastEntry.startTime)
      })

      fcpObserver.observe({ entryTypes: ['paint'] })
      this.observers.push(fcpObserver)
    } catch (error) {
      console.warn('FCP observation not supported')
    }

    // Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShift = entry as PerformanceEntry & {
            value: number
            hadRecentInput: boolean
          }

          if (!layoutShift.hadRecentInput) {
            clsValue += layoutShift.value
          }
        }

        this.metrics.cls = clsValue
        this.reportMetric('CLS', clsValue)
      })

      clsObserver.observe({ entryTypes: ['layout-shift'] })
      this.observers.push(clsObserver)
    } catch (error) {
      console.warn('CLS observation not supported')
    }

    // First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const firstEntry = entries[0] as PerformanceEntry & {
          processingStart: number
        }

        const fid = firstEntry.processingStart - firstEntry.startTime
        this.metrics.fid = fid
        this.reportMetric('FID', fid)
      })

      fidObserver.observe({ entryTypes: ['first-input'] })
      this.observers.push(fidObserver)
    } catch (error) {
      console.warn('FID observation not supported')
    }

    // Time to First Byte (TTFB)
    try {
      const navigationObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const navEntry = entries[0] as PerformanceNavigationTiming

        const ttfb = navEntry.responseStart - navEntry.requestStart
        this.metrics.ttfb = ttfb
        this.reportMetric('TTFB', ttfb)
      })

      navigationObserver.observe({ entryTypes: ['navigation'] })
      this.observers.push(navigationObserver)
    } catch (error) {
      console.warn('TTFB observation not supported')
    }
  }

  private reportMetric(name: string, value: number) {
    // Report to analytics service (e.g., Google Analytics)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'web_vitals', {
        event_category: 'Web Vitals',
        event_label: name,
        value: Math.round(value),
        non_interaction: true,
      })
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Web Vital ${name}:`, value)
    }
  }

  public getMetrics(): WebVitalsMetrics {
    return { ...this.metrics }
  }

  public destroy() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

// Singleton instance
let performanceMonitor: PerformanceMonitor | null = null

export const getPerformanceMonitor = (): PerformanceMonitor => {
  if (!performanceMonitor && typeof window !== 'undefined') {
    performanceMonitor = new PerformanceMonitor()
  }
  return performanceMonitor!
}

// React hook for performance monitoring
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<WebVitalsMetrics>({
    cls: null,
    fid: null,
    lcp: null,
    fcp: null,
    ttfb: null,
  })

  useEffect(() => {
    const monitor = getPerformanceMonitor()

    const interval = setInterval(() => {
      setMetrics(monitor.getMetrics())
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  return metrics
}

// Performance optimization utilities
export const performanceUtils = {
  // Debounced function for performance
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout
    return (...args: Parameters<T>) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  },

  // Throttled function for performance
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => (inThrottle = false), limit)
      }
    }
  },

  // Lazy loading utility
  lazyLoad: (callback: () => void, options?: IntersectionObserverInit) => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      callback()
      return
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback()
          observer.disconnect()
        }
      })
    }, options)

    return observer
  },

  // Image preloading utility
  preloadImage: (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = reject
      img.src = src
    })
  },

  // Resource hint utilities
  preloadResource: (url: string, as: string, type?: string) => {
    if (typeof document === 'undefined') return

    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = url
    link.as = as
    if (type) link.type = type

    document.head.appendChild(link)
  },

  // Bundle size monitoring
  logBundleSize: () => {
    if (typeof window === 'undefined') return

    // This would typically integrate with build tools like webpack-bundle-analyzer
    console.log('Bundle size monitoring would be implemented here')
  },
}

// Performance measurement utilities
export const measurePerformance = {
  // Measure function execution time
  measureExecutionTime: <T extends (...args: any[]) => any>(
    func: T,
    label: string
  ): T => {
    return ((...args: Parameters<T>) => {
      const start = performance.now()
      const result = func(...args)
      const end = performance.now()

      console.log(`${label} took ${end - start} milliseconds`)

      return result
    }) as T
  },

  // Measure component render time
  measureRenderTime: (componentName: string) => {
    if (typeof window === 'undefined') return

    const start = performance.now()

    return () => {
      const end = performance.now()
      console.log(`${componentName} render took ${end - start} milliseconds`)
    }
  },
}

export default performanceUtils
