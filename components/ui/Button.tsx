import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = React.memo(({
  children,
  className,
  variant = 'primary',
  isLoading = false,
  disabled,
  ...props
}) => {
  const baseClasses = 'px-5 py-2.5 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group';

  const variantClasses = {
    primary: `
      bg-gradient-to-r from-brand to-brand-accent 
      text-brand-foreground 
      hover:shadow-glow-brand
      focus:ring-brand
      shadow-lg shadow-brand/20
      hover:shadow-xl hover:shadow-brand/30
      before:absolute before:inset-0 
      before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
      before:translate-x-[-200%] hover:before:translate-x-[200%]
      before:transition-transform before:duration-700
    `,
    secondary: `
      bg-secondary 
      text-secondary-foreground 
      hover:bg-secondary/80 
      focus:ring-secondary 
      border border-border 
      shadow-md hover:shadow-lg
      hover:border-border/60
    `,
    destructive: `
      bg-gradient-to-r from-destructive to-red-600
      text-destructive-foreground 
      hover:shadow-lg hover:shadow-destructive/30
      focus:ring-destructive 
      shadow-md shadow-destructive/20
    `,
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Chargement...
        </span>
      ) : (
        children
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
