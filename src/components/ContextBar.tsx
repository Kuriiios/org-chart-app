import React, { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding } from '@fortawesome/free-solid-svg-icons';
import type { Department } from '../types/Department';

type ActiveView = 'overview' | 'carousel';

interface ContextBarProps {
  activeView: ActiveView;
  selectedDepartmentId: string | null;
  departments: Department[];
}

export const ContextBar: React.FC<ContextBarProps> = ({
  selectedDepartmentId,
  departments,
}) => {
  const deptMap = useMemo(
    () => Object.fromEntries(departments.map(d => [d.id, d])) as Record<string, Department>,
    [departments],
  );

  // Walk up parentId chain to build [root, …, leaf] breadcrumb path
  const breadcrumb = useMemo<Department[]>(() => {
    if (!selectedDepartmentId) return [];
    const path: Department[] = [];
    let current: Department | undefined = deptMap[selectedDepartmentId];
    while (current) {
      path.unshift(current);
      current = current.parentId ? deptMap[current.parentId] : undefined;
    }
    const rootDept = departments.find(
      d => d.slug === 'direction-generale' || d.name === 'Direction Générale'
    );
    if (rootDept && path.length > 0 && path[0].id !== rootDept.id) {
      path.unshift(rootDept);
    }
    return path;
  }, [selectedDepartmentId, deptMap]);


  return (
    <div className="sticky top-14 z-10 flex items-center gap-3 px-6 h-10 bg-white border-b border-slate-200 shrink-0 text-sm">
      {/* Breadcrumb — or "Tous les collaborateurs" at root */}
      {breadcrumb.length > 0 ? (
        <nav aria-label="Fil d'Ariane" className="flex items-center gap-1 overflow-hidden min-w-0">
          {breadcrumb.map((dept, i) => (
            <React.Fragment key={dept.id}>
              {i > 0 && (
                <span className="text-slate-400 mx-0.5 shrink-0" aria-hidden>›</span>
              )}
              <span className="flex items-center gap-2 min-w-0">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dept.colorClass ?? 'bg-slate-300'}`} />
                <span
                  className={`truncate ${
                    i === breadcrumb.length - 1
                      ? 'text-slate-800 font-medium'
                      : 'text-slate-500'
                  }`}
                >
                  {dept.name}
                </span>
              </span>
            </React.Fragment>
          ))}
        </nav>
      ) : (
        <span className="text-slate-500"> <FontAwesomeIcon icon={faBuilding} /> Tous les départements</span>
      )}
    </div>
  );
};

export default ContextBar;
