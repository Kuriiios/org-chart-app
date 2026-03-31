import React from 'react';
import type { Collaborator } from '../types/Collaborator';
import type { Department } from '../types/Department';
import PersonCard from './PersonCard';

interface OrgCarouselViewProps {
  collaborators: Collaborator[];
  deptMap: Record<string, Department>;
  onSelectCollaborator: (id: string) => void;
}

// OrgCarouselView renders a grid of PersonCards for whatever slice of
// collaborators App passes in (whole company, or a single sub-team).
// Headings are intentionally left to App so the same component works in both contexts.
export const OrgCarouselView: React.FC<OrgCarouselViewProps> = ({ collaborators, deptMap, onSelectCollaborator }) => {
  if (collaborators.length === 0) {
    return <p className="text-slate-400 italic">Aucun collaborateur pour le moment.</p>;
  }
  return (
    
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {collaborators.map(c => (
        <PersonCard
          key={c.id}
          collaborator={c}
          department={c.departmentId ? deptMap[c.departmentId] : undefined}
          onClick={() => onSelectCollaborator(c.id)}
          variant="carousel"
        />
      ))}
    </div>
  
  );
};

export default OrgCarouselView;
