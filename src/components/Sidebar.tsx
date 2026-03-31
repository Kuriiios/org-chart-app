import React, { useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faFileImage } from '@fortawesome/free-solid-svg-icons';
import type { Department } from '../types/Department';
import type { Collaborator } from '../types/Collaborator';

type ActiveView = 'overview' | 'carousel';

interface SidebarProps {
  departments: Department[];
  collaborators: Collaborator[];
  selectedDepartmentId: string | null;
  onSelectDepartment: (id: string | null) => void;
  activeView: ActiveView;
  onChangeView: (view: ActiveView) => void;
}

const NAV_ITEMS: { view: ActiveView; label: string; icon: React.ReactNode }[] = [
  { view: 'carousel',  label: 'Carrousel',       icon: <FontAwesomeIcon icon={faFileImage} /> },
  { view: 'overview',  label: "Vue d'ensemble", icon: <FontAwesomeIcon icon={faBuilding} /> },
];

export const Sidebar: React.FC<SidebarProps> = ({
  departments, collaborators, selectedDepartmentId, onSelectDepartment, activeView, onChangeView,
}) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredDepartments = departments;
  // Sub-departments only appear when their parent is expanded
  const hierarchicalDepts = useMemo(() => {
    const results: { dept: (typeof departments)[number]; depth: number }[] = [];
    const addChildren = (parentId: string | null, depth: number) => {
      filteredDepartments
        .filter(d => (d.parentId ?? null) === parentId)
        .forEach(d => {
          results.push({ dept: d, depth });
          // Only recurse into children if this dept is currently expanded
          if (expandedIds.has(d.id)) {
            addChildren(d.id, depth + 1);
          }
        });
    };
    addChildren(null, 0);
    return results;
  }, [filteredDepartments, expandedIds]);

  // Count collaborators in a dept AND all its sub-departments
  const countFor = (deptId: string): number => {
    const ids = new Set<string>([deptId]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const d of departments) {
        if (d.parentId && ids.has(d.parentId) && !ids.has(d.id)) {
          ids.add(d.id);
          changed = true;
        }
      }
    }
    return collaborators.filter(c => c.departmentId != null && ids.has(c.departmentId)).length;
  };

  const handleNavClick = (view: ActiveView) => {
    // Clear any selected department and switch to the chosen top-level view
    onSelectDepartment(null);
    onChangeView(view);
  };

  return (
    <aside className="flex flex-col gap-4">
      {/* ── Top-level navigation ────────────────────────────────────────── */}
      <h2
        className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2 px-1"
        style={{ color: 'var(--text)' }}
      >
        Départements
      </h2>

      <nav>
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ view, label, icon }) => {
            const isActive = activeView === view && selectedDepartmentId === null;
            return (
              <li key={view}>
                <button
                  onClick={() => handleNavClick(view)}
                  className={`w-full flex items-center gap-3 pl-3 pr-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                  {view === 'carousel' && (
                    <span className="ml-auto text-xs px-3 py-1 rounded-full bg-purple-600/20 text-purple-700 hover:bg-purple-600/30 font-medium" aria-hidden>
                      Accueil
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Departments section ─────────────────────────────────────────── */}
      <div>
        <ul className="space-y-0.5 pl-4 overflow-auto max-h-[55vh]">
          {hierarchicalDepts.map(({ dept, depth }) => {
            const count = countFor(dept.id);
            const isSelected = selectedDepartmentId === dept.id;
            const hasChildren = departments.some(d => d.parentId === dept.id);
            const isExpanded = expandedIds.has(dept.id);
            return (
              <li
                key={dept.id}
                style={{ paddingLeft: `${depth * 12}px` }}
                className={`flex items-center justify-between pl-2 pr-4 py-2 rounded-lg cursor-pointer text-sm transition-colors ${
                  isSelected
                    ? `${dept.badgeClass ?? 'bg-slate-100 text-slate-600'} font-medium`
                    : 'hover:bg-slate-50'
                }`}
                onClick={() => {
                  onSelectDepartment(dept.id);
                  if (hasChildren) toggleExpand(dept.id);
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {depth > 0 && (
                    <span className="text-slate-300 shrink-0 text-xs">└</span>
                  )}
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dept.colorClass ?? 'bg-slate-300'}`} />
                  <span className="truncate">{dept.name}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-1">
                  {hasChildren && (
                    <span className="text-slate-400 text-xs">{isExpanded ? '▾' : '▸'}</span>
                  )}
                  <span className="text-xs text-slate-400">{count}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
