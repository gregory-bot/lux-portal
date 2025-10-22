import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card = ({ children, className = '', hover = false }: CardProps) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 transition-all duration-200 ${
        hover ? 'hover:shadow-xl' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
