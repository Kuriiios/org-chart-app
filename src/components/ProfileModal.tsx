import React, { useEffect } from 'react';
import type { Collaborator } from '../types/Collaborator';
import type { Department } from '../types/Department';

interface ProfileModalProps {
  // The person whose profile is being shown (null = modal is closed)
  collaborator: Collaborator | null;
  // The collaborator's manager, looked up by managerId in the parent
  manager: Collaborator | null;
  // Direct reports, looked up by directReportIds in the parent
  directReports: Collaborator[];
  // Full Department object so we can colour the badge
  department: Department | null;
  isOpen: boolean;
  onClose: () => void;
  // Navigate to another collaborator's profile from within the modal
  onSelectCollaborator: (id: string) => void;
}

// Small reusable avatar bubble — protrudes from the header into the content area
const Avatar: React.FC<{ collaborator: Collaborator; department: Department | null; size?: 'sm' | 'lg' }> = ({ collaborator, department, size = 'sm' }) => {
  const initials = `${(collaborator.firstName || '').charAt(0)}${(collaborator.lastName || '').charAt(0)}`;
  const sizeClass = size === 'lg' ? 'w-24 h-24 text-3xl' : 'w-9 h-9 text-sm';
  // RoboHash deterministic fallback by collaborator id (or name)
  const seed = encodeURIComponent(collaborator.id ?? `${collaborator.firstName ?? ''} ${collaborator.lastName ?? ''}`);
  const photoUrl = collaborator?.photoUrl ?? `https://robohash.org/${seed}.png?size=150x150`;
  const [imageOk, setImageOk] = React.useState(false);
  React.useEffect(() => {
    setImageOk(false);
  }, [photoUrl]);
  const accentClass = department?.colorClass ?? 'bg-slate-300';

  return (
    <div className={`rounded-full bg-white flex items-center justify-center font-bold text-slate-700 shrink-0 shadow-md border-4 border-white ${sizeClass}`}>
          {photoUrl ? ( 
            <> 
              <img 
                src={photoUrl} 
                alt={initials} 
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
  );
};

export const ProfileModal: React.FC<ProfileModalProps> = ({
  collaborator, manager, directReports, department, isOpen, onClose, onSelectCollaborator,
}) => {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Render nothing when closed or when there is no collaborator to show
  if (!isOpen || !collaborator) return null;

  const name      = collaborator.fullName ?? `${collaborator.firstName} ${collaborator.lastName}`;
  const badgeClass = department?.badgeClass  ?? 'bg-slate-100 text-slate-600';

  return (
    // Full-screen overlay — clicking the backdrop closes the modal
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Profil de ${name}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      {/* Modal panel */}
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Department-coloured header — avatar bubble sits on top of this */}
        <div className={`h-24 w-full ${department?.colorClass ?? 'bg-slate-300'}`} />

        {/* Avatar bubble: centred, overflows the header downward */}
        <div className="flex justify-center" style={{ marginTop: '-3rem' }}>
          <Avatar collaborator={collaborator} department={department} size="lg" />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-3 right-4 text-white/80 hover:text-white text-xl leading-none"
        >
          &#x2715;
        </button>

        <div className="px-6 pb-6 pt-3">
          {/* ── Identity ─────────────────────────────────────────────── */}
          <div className="flex flex-col items-center text-center mb-5">
            <h2 className="text-xl font-bold text-slate-900 mt-2">{name}</h2>
            <p className="text-sm text-slate-500">{collaborator.title}</p>
            {department && (
              <span className={`inline-block mt-2 text-xs px-3 py-0.5 rounded-full font-medium ${badgeClass}`}>
                {department.name}
              </span>
            )}
          </div>

          {/* ── Email ────────────────────────────────────────────────── */}
          {collaborator.email && (
            <div className="mb-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Email</p>
              <a href={`mailto:${collaborator.email}`} className="text-blue-600 hover:underline text-sm">
                {collaborator.email}
              </a>
            </div>
          )}

          {/* ── Manager ──────────────────────────────────────────────── */}
          {manager && (
            <div className="mb-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Responsable</p>
              <button
                onClick={() => onSelectCollaborator(manager.id)}
                className="flex items-center gap-3 mx-auto px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Avatar collaborator={manager} department={department} />
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-800">
                    {manager.fullName ?? `${manager.firstName} ${manager.lastName}`}
                  </p>
                  <p className="text-xs text-slate-500">{manager.title}</p>
                </div>
              </button>
            </div>
          )}

          {/* ── Direct reports ───────────────────────────────────────── */}
          {directReports.length > 0 && (
            <div className="mb-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
                Collaborateurs directs ({directReports.length})
              </p>
              <ul className="space-y-2">
                {directReports.map(dr => (
                  <li key={dr.id} className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => onSelectCollaborator(dr.id)}
                      className="flex items-center gap-3 mx-auto px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <Avatar collaborator={dr} department={department} />
                      <div className="text-left">
                        <p className="text-sm font-medium text-slate-800">
                          {dr.fullName ?? `${dr.firstName} ${dr.lastName}`}
                        </p>
                        <p className="text-xs text-slate-500">{dr.title}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
