import React, { useMemo } from 'react';
import { Tree, TreeNode } from 'react-organizational-chart';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import type { Collaborator } from '../types/Collaborator';
import type { Department } from '../types/Department';

interface OrgOverviewViewProps {
  collaborators: Collaborator[];
  // O(1) lookup maps passed from App so we don't rebuild them here
  collabMap: Record<string, Collaborator>;
  deptMap: Record<string, Department>;
  onSelectCollaborator: (id: string) => void;
}

// ── Compact node card rendered inside each tree box ───────────────────────────
const OrgNode: React.FC<{
  collaborator: Collaborator;
  department?: Department;
  onClick: () => void;
}> = ({ collaborator, department, onClick }) => {
  const name     = collaborator.fullName ?? `${collaborator.firstName} ${collaborator.lastName}`;
  // Stable per-collaborator avatar fallback using RoboHash (deterministic by id)
  const seed = encodeURIComponent(collaborator?.id ?? name);
  const photoUrl = collaborator?.photoUrl ?? `https://robohash.org/${seed}.png?size=150x150`;
  const [imageOk, setImageOk] = React.useState(false); 
  React.useEffect(() => { 
    setImageOk(false); 
  }, [photoUrl]); 
  const accentClass = department?.colorClass ?? 'bg-slate-300';
  const badgeClass =
    department
      ? `${(department.colorClass ?? 'bg-slate-600').split(' ')[0]} text-white`
      : 'bg-slate-600 text-white';

  return (
    <div
      onClick={onClick}
      className="inline-flex flex-col items-center text-center border border-slate-200 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden w-36"
    >
      {/* Top strip coloured by department */}
      <div className={`h-1.5 w-full ${accentClass}`} />
      <div className="p-3 w-full">
        {/* photoUrl avatar */}
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-600 mx-auto mb-2">
          {photoUrl ? ( 
            <> 
              <img 
                src={photoUrl} 
                alt={name} 
                className={`w-full h-full  rounded-full object-cover ${imageOk ? '' : 'hidden'}`} 
                onLoad={() => setImageOk(true)} 
                onError={() => setImageOk(false)} 
              /> 
              {!imageOk && <div className={`w-full h-full ${accentClass}`} />} 
            </> 
          ) : ( 
            <div className={`w-full h-full ${accentClass}`} /> 
          )} 
        </div>
        <p className="text-xs font-semibold text-slate-900 leading-tight truncate">{name}</p>
        <p className="text-xs text-slate-500 leading-tight truncate mt-0.5">{collaborator.title ?? ''}</p>
        {department && (
          <span className={`inline-block mt-1.5 text-xs px-1.5 py-0.5 rounded-full font-medium truncate max-w-full ${badgeClass}`}>
            {department.name}
          </span>
        )}
      </div>
    </div>
  );
};

// ── Recursive tree-node builder ───────────────────────────────────────────────
// allowedIds scopes the tree to only the collaborators in the passed-in list.
// When the full company is shown, allowedIds contains every id.
// When a sub-team is shown, allowedIds only contains that dept's members,
// so children outside the dept are not rendered.
function renderNode(
  collaborator: Collaborator,
  collabMap: Record<string, Collaborator>,
  deptMap: Record<string, Department>,
  allowedIds: Set<string>,
  onSelectCollaborator: (id: string) => void,
): React.ReactNode {
  const dept = collaborator.departmentId ? deptMap[collaborator.departmentId] : undefined;
  // Only descend into children that are in scope
  const children = (collaborator.directReportIds ?? [])
    .map(id => collabMap[id])
    .filter((c): c is Collaborator => !!c && allowedIds.has(c.id));

  const label = (
    <OrgNode
      collaborator={collaborator}
      department={dept}
      onClick={() => onSelectCollaborator(collaborator.id)}
    />
  );

  if (children.length === 0) {
    return <TreeNode key={collaborator.id} label={label} />;
  }

  return (
    <TreeNode key={collaborator.id} label={label}>
      {children.map(child => renderNode(child, collabMap, deptMap, allowedIds, onSelectCollaborator))}
    </TreeNode>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export const OrgOverviewView: React.FC<OrgOverviewViewProps> = ({
  collaborators, collabMap, deptMap, onSelectCollaborator,
}) => {
  // The set of ids in scope — used to limit root detection and child traversal
  const allowedIds = useMemo(
    () => new Set(collaborators.map(c => c.id)),
    [collaborators]
  );

  // Roots = members whose manager is absent or outside the current scope
  const roots = useMemo(
    () => collaborators.filter(c => !c.managerId || !allowedIds.has(c.managerId)),
    [collaborators, allowedIds]
  );

  if (roots.length === 0) {
    return <p className="text-slate-500">Aucune structure hiérarchique trouvée.</p>;
  }

  const [primaryRoot, ...extraRoots] = roots;
  const primaryDept     = primaryRoot.departmentId ? deptMap[primaryRoot.departmentId] : undefined;
  const primaryChildren = (primaryRoot.directReportIds ?? [])
    .map(id => collabMap[id])
    .filter((c): c is Collaborator => !!c && allowedIds.has(c.id));

  return (
    <div className="relative border border-slate-200 rounded-xl bg-slate-50 overflow-hidden h-full min-h-0">
      {/* Zoom control buttons — top-right corner */}
      <TransformWrapper
        initialScale={0.85}
        minScale={0.2}
        maxScale={2}
        centerOnInit
        wheel={{ step: 0.08 }}
        doubleClick={{ disabled: false }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
              <button
                onClick={() => zoomIn()}
                className="w-8 h-8 rounded-md bg-none border border-slate-200 shadow-sm text-slate-600 hover:bg-slate-100 text-lg leading-none flex items-center justify-center"
                title="Zoom avant"
              >+</button>
              <button
                onClick={() => zoomOut()}
                className="w-8 h-8 rounded-md bg-none border border-slate-200 shadow-sm text-slate-600 hover:bg-slate-100  text-lg leading-none flex items-center justify-center"
                title="Zoom arrière"
              >−</button>
              <button
                onClick={() => resetTransform()}
                className="w-8 h-8 rounded-md bg-none border border-slate-200 shadow-sm text-slate-500 hover:bg-slate-100 text-xs leading-none flex items-center justify-center"
                title="Réinitialiser"
              >↺</button>
            </div>

            {/* TransformComponent fills the container; cursor shows grab intent */}
            <TransformComponent
              wrapperStyle={{ width: '100%', height: '100%', cursor: 'grab' }}
              contentStyle={{ padding: '48px' }}
            >
              <Tree
                lineWidth="2px"
                lineColor="#cbd5e1"
                lineBorderRadius="6px"
                label={
                  <OrgNode
                    collaborator={primaryRoot}
                    department={primaryDept}
                    onClick={() => onSelectCollaborator(primaryRoot.id)}
                  />
                }
              >
                {primaryChildren.map(child =>
                  renderNode(child, collabMap, deptMap, allowedIds, onSelectCollaborator)
                )}
                {extraRoots.map(root =>
                  renderNode(root, collabMap, deptMap, allowedIds, onSelectCollaborator)
                )}
              </Tree>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
};

export default OrgOverviewView;
