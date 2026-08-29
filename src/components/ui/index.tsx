import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
}

export function Card({ children, className = '', elevated = false }: CardProps) {
  const baseClasses = elevated ? 'card-elevated' : 'card';
  return <div className={`${baseClasses} ${className}`}>{children}</div>;
}

interface BadgeProps {
  children: React.ReactNode;
  severity?: 'critical' | 'high' | 'medium' | 'low' | 'info';
  className?: string;
}

export function Badge({ children, severity = 'info', className = '' }: BadgeProps) {
  const severityClasses = {
    critical: 'badge-critical',
    high: 'badge-high',
    medium: 'badge-medium',
    low: 'badge-low',
    info: 'badge-info',
  };

  return <span className={`${severityClasses[severity]} ${className}`}>{children}</span>;
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const variantClasses = {
    primary: 'button-primary',
    secondary: 'button-secondary',
    ghost: 'button-ghost',
  };

  return (
    <button className={`${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export function Toast({ message, type = 'info', onClose }: ToastProps) {
  const typeClasses = {
    success: 'bg-green-900/30 border-green-800 text-green-300',
    error: 'bg-red-900/30 border-red-800 text-red-300',
    info: 'bg-blue-900/30 border-blue-800 text-blue-300',
  };

  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg border ${typeClasses[type]} animate-in slide-in-from-bottom-4`}
    >
      {message}
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading...</p>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      {icon && <div className="mb-4 text-3xl opacity-50">{icon}</div>}
      <h3 className="text-lg font-medium text-slate-200 mb-2">{title}</h3>
      <p className="text-slate-400 text-sm max-w-xs">{description}</p>
    </div>
  );
}
