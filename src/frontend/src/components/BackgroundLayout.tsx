import React from 'react';

interface BackgroundLayoutProps {
  children: React.ReactNode;
}

export function BackgroundLayout({ children }: BackgroundLayoutProps) {
  return (
    <div className="relative min-h-screen bg-hero scan-line">
      {children}
    </div>
  );
}
