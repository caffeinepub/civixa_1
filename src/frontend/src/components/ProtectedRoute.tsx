import React from 'react';

// Route-level protection is handled via `beforeLoad` in App.tsx route definitions.
// This component is kept as a simple passthrough wrapper for any additional
// component-level protection needs.
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireModerator?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  return <>{children}</>;
}
