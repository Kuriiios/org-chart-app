import React, { useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import TopSearchBar from '../components/TopSearchBar';
import ContextBar from '../components/ContextBar';
import type { Department } from '../types/Department';
import type { Collaborator } from '../types/Collaborator';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../auth/authConfig';

type ActiveView = 'overview' | 'carousel';

interface AppLayoutProps {
  children: React.ReactNode;
  departments: Department[];
  collaborators: Collaborator[];
  selectedDepartmentId: string | null;
  onSelectDepartment: (id: string | null) => void;
  activeView: ActiveView;
  onChangeView: (view: ActiveView) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children, departments, collaborators, selectedDepartmentId, onSelectDepartment,
  activeView, onChangeView, searchTerm, onSearchChange,
}) => {
  const authBypass = import.meta.env.VITE_AUTH_BYPASS === 'true';
  const isTestEnv = import.meta.env.MODE === 'test';
  const isE2E = typeof window !== 'undefined' && !!(window as any).Cypress;

  const { instance } = useMsal();
  const activeAccount = instance.getActiveAccount();
  
  useEffect(() => {
    async function maybeLoginRedirect() {
      if (activeAccount || authBypass || isTestEnv || isE2E) return;

      const anyInstance = instance as any;

      // Await MSAL initialization when available to avoid uninitialized errors
      if (typeof anyInstance.initialize === 'function') {
        try {
          await anyInstance.initialize();
        } catch (initErr) {
          // eslint-disable-next-line no-console
          console.warn('MSAL initialize failed', initErr);
        }
      }

      // Re-check active account after initialize
      const currentAccount = typeof anyInstance.getActiveAccount === 'function'
        ? anyInstance.getActiveAccount()
        : instance.getActiveAccount && instance.getActiveAccount();

      if (!currentAccount) {
        if (typeof anyInstance.loginRedirect === 'function') {
          try {
            await anyInstance.loginRedirect({ ...loginRequest, redirectUri: '/' });
          } catch (err) {
            console.error('MSAL loginRedirect failed', err);
          }
        } else {
          // In stubbed environments the loginRedirect function may not exist or may be a test stub.
          // Skip immediate redirect so environment can continue and allow event registration.
          // eslint-disable-next-line no-console
          console.warn('MSAL loginRedirect is not available in this environment; skipping redirect');
        }
      }
    }

    maybeLoginRedirect();
  }, [activeAccount, authBypass, instance]);


  const handleLoginRedirect = async () => {
    const anyInstance = instance as any;
    if (isE2E) {
      // Avoid invoking a real redirect during Cypress E2E tests
      // eslint-disable-next-line no-console
      console.warn('Skipping MSAL loginRedirect in Cypress E2E mode');
      return;
    }

    if (typeof anyInstance.initialize === 'function') {
      try {
        await anyInstance.initialize();
      } catch (initErr) {
        // eslint-disable-next-line no-console
        console.warn('MSAL initialize failed', initErr);
      }
    }

    if (typeof anyInstance.loginRedirect === 'function') {
      anyInstance
        .loginRedirect({
          ...loginRequest,
          redirectUri: `https://login.microsoftonline.com/${import.meta.env.VITE_APP_TENANT_ID}`
        })
        .catch((error: any) => console.log(error));
    } else {
      // eslint-disable-next-line no-console
      console.warn('MSAL loginRedirect not available in this environment; skipping login redirect');
    }
  };

  const handleLogoutRedirect = () => {
    const anyInstance = instance as any;

    // Clear the active account locally so the app treats the user as unauthenticated.
    try {
      if (typeof anyInstance.setActiveAccount === 'function') {
        anyInstance.setActiveAccount(null);
      }
    } catch {
      // ignore if not supported by stubbed instance
    }

    // If running in auth-bypass mode, just reload so AppLayout will trigger its bypass behavior.
    if (authBypass) {
      window.location.reload();
      return;
    }

    // Try to perform a proper MSAL logout (redirect preferred) when available.
    (async () => {
      try {
        if (typeof anyInstance.logoutRedirect === 'function') {
          await anyInstance.logoutRedirect({ postLogoutRedirectUri: '/' });
          return;
        }

        if (typeof anyInstance.logoutPopup === 'function') {
          await anyInstance.logoutPopup({ postLogoutRedirectUri: '/' });
        }
      } catch (err) {
        // ignore errors from logout API and fall through to reload
      } finally {
        // Reload to trigger the app's auth checks and potential redirect to login
        window.location.reload();
      }
    })();
  };

  const isOverview = activeView === 'overview';

  // If the user is not authenticated and we are not bypassing auth,
  // and the environment supports `loginRedirect`, render a synchronous
  // redirecting UI so the main app doesn't flash briefly.
  if (!authBypass && !activeAccount && typeof (instance as any).loginRedirect === 'function' && !isTestEnv && !isE2E) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center p-6">
          <h2 className="text-lg font-semibold mb-2">Redirecting to Microsoft login…</h2>
          <p className="text-sm text-slate-500 mb-4">You will be redirected to sign in. If nothing happens, click Login.</p>
          <button
            onClick={handleLoginRedirect}
            className="rounded bg-indigo-500 px-4 py-2 text-white"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  const handleViewClick = (view: ActiveView) => {
    // Match sidebar behavior: reset department when switching top-level view
    onSelectDepartment(null);
    onChangeView(view);
  };

  return (
    <div className="h-screen overflow-hidden bg-slate-50 text-slate-900 flex flex-col">
      {/* ── Top bar ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-6 h-14 bg-white border-b border-slate-200 shrink-0">
        <span className="text-lg font-bold tracking-tight text-slate-900">Organigramme</span>
        <div className="flex items-center gap-4">
          <TopSearchBar searchTerm={searchTerm} onSearchChange={onSearchChange} />
          <div>
            {activeAccount || authBypass ? (
              <button className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500" onClick={handleLogoutRedirect}>Logout</button>

            ) : (
              <button className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500" onClick={handleLoginRedirect}>Login</button>
            )}
          </div>
        </div>
      </header>

      {/* ── Context bar: view type + breadcrumb ───────────────────────────── */}
      <ContextBar
        activeView={activeView}
        selectedDepartmentId={selectedDepartmentId}
        departments={departments}
      />

      {/* ── Mobile stacked bar: view + department selection ─────────────── */}
      <div className="md:hidden px-4 pt-3 pb-3 border-b border-slate-200 bg-white space-y-3">
        {/* View toggle */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleViewClick('carousel')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
              activeView === 'carousel' && selectedDepartmentId === null
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-300'
            }`}
          >
            Carrousel
          </button>
          <button
            type="button"
            onClick={() => handleViewClick('overview')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
              activeView === 'overview' && selectedDepartmentId === null
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-300'
            }`}
          >
            Organigramme
          </button>
        </div>

        {/* Department pills */}
        <div className="flex gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => onSelectDepartment(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border ${
              selectedDepartmentId === null
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-300'
            }`}
          >
            Tous
          </button>
          {departments.map(dept => (
            <button
              key={dept.id}
              type="button"
              onClick={() => onSelectDepartment(dept.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border ${
                selectedDepartmentId === dept.id
                  ? `${dept.badgeClass ?? 'bg-slate-900 text-white border-slate-900'}`
                  : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              {dept.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Body: sidebar (desktop) + main ────────────────────────────────── */}
      <div className="flex flex-1 w-full min-h-0 flex-col md:flex-row">
        <aside className="hidden md:block md:w-64 shrink-0 bg-white border-r border-slate-200 pt-4 pb-4 pr-3 pl-0 overflow-y-auto">
          <Sidebar
            departments={departments}
            collaborators={collaborators}
            selectedDepartmentId={selectedDepartmentId}
            onSelectDepartment={onSelectDepartment}
            activeView={activeView}
            onChangeView={onChangeView}
          />
        </aside>
        <main
          className={`flex-1 min-h-0 overflow-auto ${
            isOverview ? 'p-0 md:p-6' : 'p-6'
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
