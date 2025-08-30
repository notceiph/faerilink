'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image, { ImageProps } from 'next/image'
import { cn } from '@/lib/utils'

interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
  src: string
  fallbackSrc?: string
  alt: string
  priority?: boolean
  quality?: number
  enableBlur?: boolean
  enableLazy?: boolean
  onLoad?: () => void
  onError?: () => void
  containerClassName?: string
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  fallbackSrc,
  alt,
  priority = false,
  quality = 75,
  enableBlur = true,
  enableLazy = true,
  onLoad,
  onError,
  containerClassName,
  className,
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(!enableLazy || priority)
  const imgRef = useRef<HTMLImageElement>(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!enableLazy || priority || isInView) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.01,
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [enableLazy, priority, isInView])

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    setIsLoading(false)

    // Try fallback image if available
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc)
      setHasError(false)
      setIsLoading(true)
    }

    onError?.()
  }

  // Don't render until in view for lazy loading
  if (!isInView) {
    return (
      <div
        ref={imgRef}
        className={cn(
          'animate-pulse bg-muted rounded',
          containerClassName
        )}
        style={{
          width: props.width || 'auto',
          height: props.height || 'auto',
        }}
        aria-label={`Loading image: ${alt}`}
      />
    )
  }

  return (
    <div className={cn('relative overflow-hidden', containerClassName)}>
      <Image
        {...props}
        src={currentSrc}
        alt={alt}
        quality={quality}
        priority={priority}
        className={cn(
          'transition-all duration-300',
          isLoading && enableBlur && 'blur-sm scale-105',
          !isLoading && 'blur-0 scale-100',
          hasError && 'opacity-50',
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        placeholder={enableBlur ? 'blur' : 'empty'}
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="w-8 h-8 mx-auto mb-2 opacity-50">
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                className="w-full h-full"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-xs">Failed to load image</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Avatar component with optimization
interface AvatarProps {
  src?: string
  alt: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export const OptimizedAvatar: React.FC<AvatarProps> = ({
  src,
  alt,
  fallback,
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  }

  const getFallbackInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2)
  }

  if (!src) {
    return (
      <div
        className={cn(
          'rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium',
          sizeClasses[size],
          className
        )}
      >
        {fallback ? getFallbackInitials(fallback) : alt.charAt(0).toUpperCase()}
      </div>
    )
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size === 'sm' ? 32 : size === 'md' ? 48 : size === 'lg' ? 64 : 96}
      height={size === 'sm' ? 32 : size === 'md' ? 48 : size === 'lg' ? 64 : 96}
      className={cn(
        'rounded-full object-cover',
        sizeClasses[size],
        className
      )}
      enableBlur={false}
      quality={80}
    />
  )
}

export default OptimizedImage
