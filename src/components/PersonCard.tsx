import React from 'react';
import type { Collaborator } from '../types/Collaborator';
import type { Department } from '../types/Department';

// Component: PersonCard
// variant="compact"  (default) – horizontal strip used in org-tree and department grid
// variant="carousel" – tall card with large avatar area (top 2/3) used in the carousel view
interface PersonCardProps {
  collaborator?: Collaborator;
  department?: Department;
  onClick?: () => void;
  variant?: 'compact' | 'carousel';
}

export const PersonCard: React.FC<PersonCardProps> = ({ collaborator, department, onClick, variant = 'compact' }) => {
  const name     = collaborator?.fullName ?? `${collaborator?.firstName ?? 'Jean'} ${collaborator?.lastName ?? 'Moreau'}`;
  const title    = collaborator?.title ?? 'Directeur Financier';
  const deptName = department?.name ?? collaborator?.departmentName ?? 'Finance';
  const email    = collaborator?.email ?? 'jean.moreau@example.com';
  // Use the real photo when present; fallback to RoboHash deterministic seed
  const seed = encodeURIComponent(collaborator?.id ?? name);
  const photoUrl = collaborator?.photoUrl ?? `https://robohash.org/${seed}.png?size=150x150`;
  const [imageOk, setImageOk] = React.useState(false); 
  React.useEffect(() => { 
    setImageOk(false); 
  }, [photoUrl]); 
  const accentClass = department?.colorClass ?? 'bg-slate-300';
  const badgeClass  = department?.badgeClass  ?? 'bg-slate-100 text-slate-600';

  // ── Carousel variant: top photo area (cover) with a protruding avatar bubble ─────
  if (variant === 'carousel') {
    return (
      <article
        onClick={onClick}
        className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
      >
        {/* Top photo area (fallback to accent color when no photo) */}
        <div className="w-full shrink-0 overflow-hidden" style={{ height: '11rem' }}>
          {photoUrl ? ( 
            <> 
              <img 
                src={photoUrl} 
                alt={name} 
                className={`w-full h-full object-cover ${imageOk ? '' : 'hidden'}`} 
                onLoad={() => setImageOk(true)} 
                onError={() => setImageOk(false)} 
              /> 
              {!imageOk && <div className={`w-full h-full ${accentClass}`} />} 
            </> 
          ) : ( 
            <div className={`w-full h-full ${accentClass}`} /> 
          )} 
        </div>



        {/* Text info below bubble */}
        <div className="flex flex-col items-center text-center px-4 pb-4 pt-2 gap-0.5">
          <h3 className="font-semibold text-slate-900 text-base leading-tight">{name}</h3>
          <p className="text-sm text-slate-500">{title}</p>
          <span className={`mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${badgeClass}`}>{deptName}</span>
          <a
            href={`mailto:${email}`}
            onClick={e => e.stopPropagation()}
            className="mt-2 text-xs text-slate-400 hover:text-blue-600 hover:underline"
          >
            {email}
          </a>
        </div>
      </article>
    );
  }

  // ── Compact variant (default): horizontal strip ─────────────────────────
  return (
    <article
      onClick={onClick}
      className="flex overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className={`w-1.5 shrink-0 ${accentClass}`} />
      <div className="flex-1 p-4">
        <div className="flex items-start gap-3">
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
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 truncate">{name}</h3>
            <p className="text-sm text-slate-500 truncate">{title}</p>
            <span className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium ${badgeClass}`}>
              {deptName}
            </span>
          </div>
        </div>
        <div className="mt-3 text-xs">
          <a
            href={`mailto:${email}`}
            onClick={e => e.stopPropagation()}
            className="text-slate-500 hover:text-blue-600 hover:underline truncate block"
          >
            {email}
          </a>
        </div>
      </div>
    </article>
  );
};

export default PersonCard;
