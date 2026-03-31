import React from 'react';
import Sidebar from '../components/Sidebar';
import TopSearchBar from '../components/TopSearchBar';
import ContextBar from '../components/ContextBar';
import type { Department } from '../types/Department';
import type { Collaborator } from '../types/Collaborator';

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
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* ── Top bar ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-6 h-14 bg-white border-b border-slate-200 shrink-0">
        <span className="text-lg font-bold tracking-tight text-slate-900">Organigramme</span>
        <TopSearchBar searchTerm={searchTerm} onSearchChange={onSearchChange} />
      </header>

      {/* ── Context bar: view type + breadcrumb ───────────────────────────── */}
      <ContextBar
        activeView={activeView}
        selectedDepartmentId={selectedDepartmentId}
        departments={departments}
      />

      {/* ── Body: sidebar + main ───────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden w-full">
        <aside className="w-64 shrink-0 bg-white border-r border-slate-200 pt-4 pb-4 pr-3 pl-0 overflow-y-auto">
          <Sidebar
            departments={departments}
            collaborators={collaborators}
            selectedDepartmentId={selectedDepartmentId}
            onSelectDepartment={onSelectDepartment}
            activeView={activeView}
            onChangeView={onChangeView}
          />
        </aside>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
