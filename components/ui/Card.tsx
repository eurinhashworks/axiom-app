import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  ref?: React.Ref<HTMLDivElement>;
  variant?: 'default' | 'glass';
}

const Card = React.memo(React.forwardRef<HTMLDivElement, CardProps>(({ children, className, onClick, variant = 'default' }, ref) => {
  const baseClasses = 'rounded-xl p-6 transition-all duration-300';

  const variantClasses = {
    default: 'bg-card border border-border shadow-premium hover:shadow-xl hover:border-border/60 hover:-translate-y-0.5',
    glass: 'glass shadow-lg hover:shadow-xl hover:-translate-y-0.5',
  };

  return (
    <div
      ref={ref}
      className={`${baseClasses} ${variantClasses[variant]} ${onClick ? 'cursor-pointer hover:scale-[1.01]' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}));

Card.displayName = 'Card';

export default Card;
