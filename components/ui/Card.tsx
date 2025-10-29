import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  ref?: React.Ref<HTMLDivElement>;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ children, className, onClick }, ref) => {
  return (
    <div 
      ref={ref}
      className={`bg-card border border-border rounded-lg shadow-sm p-6 transition-all hover:shadow-md ${className}`} 
      onClick={onClick}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export default Card;
