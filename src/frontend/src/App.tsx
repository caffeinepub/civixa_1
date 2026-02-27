import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  Outlet,
  redirect,
} from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';

import { SessionProvider, useSession } from './context/SessionContext';
import { DataProvider } from './context/DataContext';

import { Home } from './pages/Home';
import { LoginAdmin } from './pages/LoginAdmin';
import { LoginModerator } from './pages/LoginModerator';
import { ChangePassword } from './pages/ChangePassword';
import { Admin } from './pages/Admin';
import { AdminDatabase } from './pages/AdminDatabase';
import { Moderator } from './pages/Moderator';

import { seedIfEmpty } from './lib/storage';
import { getSession } from './lib/storage';

// Seed data on app load
seedIfEmpty();

// ─── Root Layout ─────────────────────────────────────────────────────────────
function RootLayout() {
  return (
    <>
      <Outlet />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'oklch(0.18 0.03 245)',
            border: '1px solid oklch(0.32 0.04 245)',
            color: 'oklch(0.94 0.015 245)',
          },
        }}
      />
    </>
  );
}

// ─── Route Definitions ───────────────────────────────────────────────────────
const rootRoute = createRootRoute({ component: RootLayout });

const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: Home });
const loginAdminRoute = createRoute({ getParentRoute: () => rootRoute, path: '/login/admin', component: LoginAdmin });
const loginModeratorRoute = createRoute({ getParentRoute: () => rootRoute, path: '/login/moderator', component: LoginModerator });
const changePasswordRoute = createRoute({ getParentRoute: () => rootRoute, path: '/change-password', component: ChangePassword });

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: Admin,
  beforeLoad: () => {
    const session = getSession();
    if (!session || !session.isAdmin) {
      throw redirect({ to: '/login/admin' });
    }
    if (session.mustChangePassword) {
      throw redirect({ to: '/change-password' });
    }
  },
});

const adminDatabaseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/database',
  component: AdminDatabase,
  beforeLoad: () => {
    const session = getSession();
    if (!session || !session.isAdmin) {
      throw redirect({ to: '/login/admin' });
    }
    if (session.mustChangePassword) {
      throw redirect({ to: '/change-password' });
    }
  },
});

const moderatorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/moderator',
  component: Moderator,
  beforeLoad: () => {
    const session = getSession();
    if (!session || !session.isModerator) {
      throw redirect({ to: '/login/moderator' });
    }
    if (session.mustChangePassword) {
      throw redirect({ to: '/change-password' });
    }
  },
});

// ─── Router ──────────────────────────────────────────────────────────────────
const routeTree = rootRoute.addChildren([
  indexRoute,
  loginAdminRoute,
  loginModeratorRoute,
  changePasswordRoute,
  adminRoute,
  adminDatabaseRoute,
  moderatorRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <SessionProvider>
      <DataProvider>
        <RouterProvider router={router} />
      </DataProvider>
    </SessionProvider>
  );
}
