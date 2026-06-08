import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`${sizeClasses[size]} animate-spin`}>
      <div className="w-full h-full rounded-full border-2 border-secondary-200 border-t-primary-600" />
    </div>
  );
}

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-secondary-500">{message}</p>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex gap-2 mb-3">
            <div className="skeleton w-20 h-6 rounded-full" />
            <div className="skeleton w-24 h-6 rounded-full" />
          </div>
          <div className="skeleton w-3/4 h-6 mb-2" />
          <div className="skeleton w-full h-4 mb-1" />
          <div className="skeleton w-2/3 h-4 mb-3" />
          <div className="flex gap-4">
            <div className="skeleton w-16 h-4" />
            <div className="skeleton w-16 h-4" />
            <div className="skeleton w-16 h-4" />
          </div>
        </div>
        <div className="skeleton w-24 h-24 rounded-lg" />
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-secondary-100">
        <div className="flex items-center gap-3">
          <div className="skeleton w-8 h-8 rounded-full" />
          <div>
            <div className="skeleton w-20 h-4 mb-1" />
            <div className="skeleton w-16 h-3" />
          </div>
        </div>
        <div className="skeleton w-10 h-10 rounded-lg" />
      </div>
    </div>
  );
}
