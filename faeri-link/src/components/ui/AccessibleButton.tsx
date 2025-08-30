import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { focusUtils, keyboardUtils, motionUtils } from '@/lib/accessibility'

const accessibleButtonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface AccessibleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof accessibleButtonVariants> {
  asChild?: boolean
  loading?: boolean
  loadingText?: string
  ariaLabel?: string
  ariaDescribedBy?: string
  onClick?: () => void
}

const AccessibleButton = React.forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({
    className,
    variant,
    size,
    asChild = false,
    loading = false,
    loadingText,
    ariaLabel,
    ariaDescribedBy,
    disabled,
    onClick,
    children,
    ...props
  }, ref) => {
    const buttonRef = React.useRef<HTMLButtonElement>(null)
    const [isPressed, setIsPressed] = React.useState(false)

    React.useImperativeHandle(ref, () => buttonRef.current!)

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || disabled) {
        event.preventDefault()
        return
      }

      // Provide haptic feedback if available
      if ('vibrate' in navigator && !motionUtils.prefersReducedMotion()) {
        navigator.vibrate(50)
      }

      onClick?.()
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      keyboardUtils.handleKeyDown(event, {
        onEnter: () => {
          if (!loading && !disabled) {
            onClick?.()
          }
        },
        onSpace: () => {
          if (!loading && !disabled) {
            event.preventDefault()
            onClick?.()
          }
        },
      })
    }

    const handleMouseDown = () => {
      setIsPressed(true)
    }

    const handleMouseUp = () => {
      setIsPressed(false)
    }

    const handleMouseLeave = () => {
      setIsPressed(false)
    }

    const isDisabled = disabled || loading

    return (
      <button
        className={cn(
          accessibleButtonVariants({ variant, size, className }),
          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          isPressed && 'scale-95',
          isDisabled && 'cursor-not-allowed',
          loading && 'cursor-wait'
        )}
        ref={buttonRef}
        disabled={isDisabled}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-pressed={isPressed}
        aria-disabled={isDisabled}
        role="button"
        tabIndex={isDisabled ? -1 : 0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="mr-2 h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {loadingText || 'Loading...'}
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)
AccessibleButton.displayName = 'AccessibleButton'

// Specialized button types for common use cases
export const AccessibleIconButton = React.forwardRef<
  HTMLButtonElement,
  AccessibleButtonProps & {
    icon: React.ReactNode
    tooltip?: string
  }
>(({ icon, tooltip, ariaLabel, ...props }, ref) => (
  <AccessibleButton
    ref={ref}
    size="icon"
    ariaLabel={ariaLabel || tooltip}
    {...props}
  >
    {icon}
  </AccessibleButton>
))
AccessibleIconButton.displayName = 'AccessibleIconButton'

export const AccessibleToggleButton = React.forwardRef<
  HTMLButtonElement,
  AccessibleButtonProps & {
    pressed: boolean
    onPressedChange: (pressed: boolean) => void
  }
>(({ pressed, onPressedChange, children, ...props }, ref) => (
  <AccessibleButton
    ref={ref}
    aria-pressed={pressed}
    onClick={() => onPressedChange(!pressed)}
    {...props}
  >
    {children}
  </AccessibleButton>
))
AccessibleToggleButton.displayName = 'AccessibleToggleButton'

export const AccessibleMenuButton = React.forwardRef<
  HTMLButtonElement,
  AccessibleButtonProps & {
    expanded: boolean
    onExpandedChange: (expanded: boolean) => void
    controls: string
  }
>(({ expanded, onExpandedChange, controls, children, ...props }, ref) => (
  <AccessibleButton
    ref={ref}
    aria-expanded={expanded}
    aria-controls={controls}
    aria-haspopup="menu"
    onClick={() => onExpandedChange(!expanded)}
    {...props}
  >
    {children}
  </AccessibleButton>
))
AccessibleMenuButton.displayName = 'AccessibleMenuButton'

export { AccessibleButton, accessibleButtonVariants }
