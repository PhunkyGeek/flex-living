import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
}

/**
 * A simple button component inspired by shadcn/ui.  Uses Tailwind classes
 * to provide consistent styling.  Variants adjust colours accordingly.
 */
export default function Button({ children, variant = 'primary', className = '', ...props }: ButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors';
  let variantClasses = '';
  switch (variant) {
    case 'primary':
      variantClasses = 'bg-brand text-white hover:bg-brand-dark focus:ring-brand-dark';
      break;
    case 'secondary':
      variantClasses = 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-300';
      break;
    case 'danger':
      variantClasses = 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-600';
      break;
  }
  return (
    <button className={`${base} ${variantClasses} ${className}`} {...props}>
      {children}
    </button>
  );
}