import React from 'react';
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
  const { instance } = useMsal();
  const activeAccount = instance.getActiveAccount();
  
  const handleLoginRedirect = () => {
    instance
      .loginRedirect({
        ...loginRequest,
        redirectUri: '/',
      })
      .catch((error) => console.log(error));
  };

  const handleLogoutRedirect = () => {
    instance.logoutPopup({
      postLogoutRedirectUri: '/',
    });
    window.location.reload();
  };

  const isOverview = activeView === 'overview';

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
            {activeAccount ? (
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
