import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    variant?: 'default' | 'glass';
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    variant = 'default',
    className = '',
    disabled,
    ...props
}, ref) => {
    const baseClasses = `
    w-full px-4 py-2.5 rounded-lg
    text-foreground placeholder-muted-foreground
    transition-all duration-300
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

    const variantClasses = {
        default: `
      bg-input border border-border
      hover:border-border/60
      focus:border-brand focus:ring-brand/40
      focus:shadow-glow-brand
    `,
        glass: `
      glass border-white/10
      hover:border-white/20
      focus:border-brand/60 focus:ring-brand/30
      focus:shadow-glow-brand
    `,
    };

    const errorClasses = error
        ? 'border-destructive focus:ring-destructive/40 focus:border-destructive'
        : '';

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-foreground mb-2">
                    {label}
                </label>
            )}

            <div className="relative">
                {leftIcon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                        {leftIcon}
                    </div>
                )}

                <input
                    ref={ref}
                    disabled={disabled}
                    className={`
            ${baseClasses}
            ${variantClasses[variant]}
            ${errorClasses}
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${className}
          `}
                    {...props}
                />

                {rightIcon && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-muted-foreground">
                        {rightIcon}
                    </div>
                )}
            </div>

            {error && (
                <p className="mt-1.5 text-sm text-destructive animate-slide-down">
                    {error}
                </p>
            )}

            {helperText && !error && (
                <p className="mt-1.5 text-sm text-muted-foreground">
                    {helperText}
                </p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

// Textarea variant
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
    variant?: 'default' | 'glass';
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
    label,
    error,
    helperText,
    variant = 'default',
    className = '',
    disabled,
    ...props
}, ref) => {
    const baseClasses = `
    w-full px-4 py-2.5 rounded-lg
    text-foreground placeholder-muted-foreground
    transition-all duration-300
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background
    disabled:opacity-50 disabled:cursor-not-allowed
    resize-none
  `;

    const variantClasses = {
        default: `
      bg-input border border-border
      hover:border-border/60
      focus:border-brand focus:ring-brand/40
      focus:shadow-glow-brand
    `,
        glass: `
      glass border-white/10
      hover:border-white/20
      focus:border-brand/60 focus:ring-brand/30
      focus:shadow-glow-brand
    `,
    };

    const errorClasses = error
        ? 'border-destructive focus:ring-destructive/40 focus:border-destructive'
        : '';

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-foreground mb-2">
                    {label}
                </label>
            )}

            <textarea
                ref={ref}
                disabled={disabled}
                className={`
          ${baseClasses}
          ${variantClasses[variant]}
          ${errorClasses}
          ${className}
        `}
                {...props}
            />

            {error && (
                <p className="mt-1.5 text-sm text-destructive animate-slide-down">
                    {error}
                </p>
            )}

            {helperText && !error && (
                <p className="mt-1.5 text-sm text-muted-foreground">
                    {helperText}
                </p>
            )}
        </div>
    );
});

Textarea.displayName = 'Textarea';

export default Input;
