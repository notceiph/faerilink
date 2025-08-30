import * as React from 'react'
import { cn } from '@/lib/utils'
import { formUtils, ariaUtils } from '@/lib/accessibility'

export interface AccessibleInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string
  description?: string
  error?: string | string[]
  required?: boolean
  validation?: {
    required?: boolean
    minLength?: number
    maxLength?: number
    pattern?: RegExp
    email?: boolean
  }
  onValueChange?: (value: string) => void
  onValidationChange?: (errors: string[]) => void
  showValidation?: boolean
}

const AccessibleInput = React.forwardRef<HTMLInputElement, AccessibleInputProps>(
  ({
    className,
    type = 'text',
    id,
    name,
    label,
    description,
    error,
    required,
    validation,
    onValueChange,
    onValidationChange,
    showValidation = true,
    'aria-describedby': ariaDescribedBy,
    ...props
  }, ref) => {
    const inputId = id || formUtils.generateFieldId(name || 'input')
    const descriptionId = `${inputId}-description`
    const errorId = `${inputId}-error`

    const [value, setValue] = React.useState(props.defaultValue?.toString() || props.value?.toString() || '')
    const [validationErrors, setValidationErrors] = React.useState<string[]>([])

    // Generate describedBy IDs
    const describedByIds = [
      description && descriptionId,
      (error || validationErrors.length > 0) && errorId,
      ariaDescribedBy
    ].filter(Boolean).join(' ')

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value
      setValue(newValue)
      onValueChange?.(newValue)

      // Run validation if enabled
      if (validation) {
        const errors = formUtils.validateField(newValue, validation)
        setValidationErrors(errors)
        onValidationChange?.(errors)
      }
    }

    const handleBlur = () => {
      // Final validation on blur
      if (validation) {
        const errors = formUtils.validateField(value, validation)
        setValidationErrors(errors)
        onValidationChange?.(errors)
      }
    }

    const hasError = error || validationErrors.length > 0
    const errorMessages = Array.isArray(error) ? error : error ? [error] : validationErrors

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
            {required && (
              <span className="text-red-500 ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        {description && (
          <p
            id={descriptionId}
            className="text-sm text-muted-foreground"
          >
            {description}
          </p>
        )}

        <div className="relative">
          <input
            {...props}
            ref={ref}
            id={inputId}
            name={name}
            type={type}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              hasError && 'border-red-500 focus-visible:ring-red-500',
              className
            )}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-required={required}
            aria-invalid={!!hasError}
            aria-describedby={describedByIds}
            required={required}
          />

          {/* Character count for text inputs */}
          {validation?.maxLength && (
            <div className="absolute bottom-2 right-3 text-xs text-muted-foreground">
              {value.length}/{validation.maxLength}
            </div>
          )}
        </div>

        {/* Error messages */}
        {showValidation && errorMessages.length > 0 && (
          <div id={errorId} className="space-y-1">
            {errorMessages.map((errorMsg, index) => (
              <p
                key={index}
                className="text-sm text-red-600 flex items-start gap-1"
                role="alert"
                aria-live="polite"
              >
                <svg
                  className="w-4 h-4 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errorMsg}
              </p>
            ))}
          </div>
        )}

        {/* Success indicator */}
        {showValidation && validation && value && !hasError && (
          <div className="flex items-center gap-1 text-sm text-green-600">
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Looks good!
          </div>
        )}
      </div>
    )
  }
)
AccessibleInput.displayName = 'AccessibleInput'

// Specialized input types
export const AccessibleEmailInput = React.forwardRef<
  HTMLInputElement,
  AccessibleInputProps
>((props, ref) => (
  <AccessibleInput
    {...props}
    ref={ref}
    type="email"
    validation={{ ...props.validation, email: true }}
  />
))
AccessibleEmailInput.displayName = 'AccessibleEmailInput'

export const AccessiblePasswordInput = React.forwardRef<
  HTMLInputElement,
  AccessibleInputProps & {
    showPassword?: boolean
    onTogglePassword?: () => void
  }
>(({ showPassword, onTogglePassword, ...props }, ref) => (
  <div className="space-y-2">
    <AccessibleInput
      {...props}
      ref={ref}
      type={showPassword ? 'text' : 'password'}
      validation={{ ...props.validation, minLength: 8 }}
    />
    {onTogglePassword && (
      <button
        type="button"
        onClick={onTogglePassword}
        className="text-sm text-primary hover:underline"
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? 'Hide' : 'Show'} password
      </button>
    )}
  </div>
))
AccessiblePasswordInput.displayName = 'AccessiblePasswordInput'

export const AccessibleSearchInput = React.forwardRef<
  HTMLInputElement,
  AccessibleInputProps & {
    onSearch?: (query: string) => void
    loading?: boolean
  }
>(({ onSearch, loading, onValueChange, ...props }, ref) => {
  const [searchTimeout, setSearchTimeout] = React.useState<NodeJS.Timeout | null>(null)

  const handleChange = (value: string) => {
    onValueChange?.(value)

    // Debounced search
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    const timeout = setTimeout(() => {
      onSearch?.(value)
    }, 300)

    setSearchTimeout(timeout)
  }

  React.useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
    }
  }, [searchTimeout])

  return (
    <div className="relative">
      <AccessibleInput
        {...props}
        ref={ref}
        onValueChange={handleChange}
        aria-describedby={`${props.id || 'search'}-status`}
      />
      {loading && (
        <div
          id={`${props.id || 'search'}-status`}
          className="absolute right-3 top-1/2 transform -translate-y-1/2"
          aria-live="polite"
        >
          <svg
            className="w-4 h-4 animate-spin text-muted-foreground"
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
        </div>
      )}
    </div>
  )
})
AccessibleSearchInput.displayName = 'AccessibleSearchInput'

export { AccessibleInput }
