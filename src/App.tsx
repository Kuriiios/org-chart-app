import { useMemo, useState } from 'react'
import AppLayout from './layout/AppLayout'
import ProfileModal from './components/ProfileModal'
import OrgOverviewView from './components/OrgOverviewView'
import OrgCarouselView from './components/OrgCarouselView'
import './App.css'
import { mockDepartments } from './data/mockDepartments'
import { mockCollaborators } from './data/mockCollaborators'
import type { Department } from './types/Department'
import type { Collaborator } from './types/Collaborator'

type ActiveView = 'overview' | 'carousel';

// App: top-level application
// Manages the active view, selected-department, and modal state.
function App() {

  const [departments] = useState<Department[]>(mockDepartments)
  const [collaborators] = useState<Collaborator[]>(mockCollaborators)
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null)
  // Which top-level view is shown when no department is selected
  const [activeView, setActiveView] = useState<ActiveView>('carousel')
  // Global collaborator search term
  const [searchTerm, setSearchTerm] = useState<string>('')

  // Modal state: which collaborator (by id) is currently being viewed
  const [modalCollaboratorId, setModalCollaboratorId] = useState<string | null>(null)

  // Open the modal for a given collaborator id
  const openModal = (id: string) => setModalCollaboratorId(id)
  // Close the modal by clearing the id
  const closeModal = () => setModalCollaboratorId(null)

  // O(1) lookup: department id → Department object
  const deptMap = useMemo(
    () => Object.fromEntries(departments.map(d => [d.id, d])) as Record<string, Department>,
    [departments]
  )

  // O(1) lookup: collaborator id → Collaborator object
  const collabMap = useMemo(
    () => Object.fromEntries(collaborators.map(c => [c.id, c])) as Record<string, Collaborator>,
    [collaborators]
  )

  // The Department object that is currently selected (or null for "all")
  const selectedDept: Department | null = selectedDepartmentId ? (deptMap[selectedDepartmentId] ?? null) : null

  // Set of department ids that match the selection including all sub-departments
  const selectedDeptIds = useMemo<Set<string> | null>(() => {
    if (!selectedDepartmentId) return null;
    const ids = new Set<string>([selectedDepartmentId]);
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
    return ids;
  }, [selectedDepartmentId, departments])

  const collaboratorsToShow: Collaborator[] = useMemo(() => {
    // First scope to the selected department AND its sub-departments (or keep all)
    const scoped = selectedDeptIds
      ? collaborators.filter(c => c.departmentId != null && selectedDeptIds.has(c.departmentId))
      : collaborators;
    // Then apply the search term across name, title, and department name
    if (!searchTerm.trim()) return scoped;
    const term = searchTerm.trim().toLowerCase();
    return scoped.filter(c =>
      (c.fullName ?? `${c.firstName} ${c.lastName}`).toLowerCase().includes(term) ||
      (c.title ?? '').toLowerCase().includes(term) ||
      (c.departmentName ?? '').toLowerCase().includes(term)
    );
  }, [collaborators, selectedDeptIds, searchTerm])

  // Derive data for the modal from the selected collaborator id
  const modalCollaborator = modalCollaboratorId ? (collabMap[modalCollaboratorId] ?? null) : null
  const modalManager      = modalCollaborator?.managerId ? (collabMap[modalCollaborator.managerId] ?? null) : null
  const modalDirectReports: Collaborator[] = modalCollaborator?.directReportIds
    ? modalCollaborator.directReportIds.map(id => collabMap[id]).filter(Boolean) as Collaborator[]
    : []
  const modalDept = modalCollaborator?.departmentId ? (deptMap[modalCollaborator.departmentId] ?? null) : null

  return (
      <AppLayout
        departments={departments}
        collaborators={collaborators}
        selectedDepartmentId={selectedDepartmentId}
        onSelectDepartment={setSelectedDepartmentId}
        activeView={activeView}
        onChangeView={setActiveView}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      >
        <div className="w-full h-full max-w-full max-h-full min-h-0">
          {activeView === 'overview' ? (
            // ── Tree view (whole company OR sub-team) ──────────────────────────────
            <div className="w-full h-full max-w-full max-h-full min-h-0">
            
              <OrgOverviewView
                collaborators={collaboratorsToShow}
                collabMap={collabMap}
                deptMap={deptMap}
                onSelectCollaborator={openModal}
              />
            </div>
          ) : (
            // ── Carousel grid (whole company OR sub-team) ─────────────────────────
            <div>
              {!selectedDept && (
                <>
                  <h1 className="text-2xl text-center font-bold text-slate-900 mb-1">Bienvenue</h1>
                  <h2 className="text-lg text-center font-semibold text-slate-700 mb-4">
                    Decouvrez nos collaborateurs
                  </h2>
                  <p className="text-sm text-slate-500 mb-6">
                    {collaboratorsToShow.length} collaborateur{collaboratorsToShow.length !== 1 ? 's' : ''}
                  </p>
                </>
              )}
              <OrgCarouselView
                collaborators={collaboratorsToShow}
                deptMap={deptMap}
                onSelectCollaborator={openModal}
              />
            </div>
          )}
        </div>
        {/* Profile modal — rendered at App level so it can access all data */}
        <ProfileModal
          collaborator={modalCollaborator}
          manager={modalManager}
          directReports={modalDirectReports}
          department={modalDept}
          isOpen={modalCollaboratorId !== null}
          onClose={closeModal}
          onSelectCollaborator={openModal}
        />
      </AppLayout>
  )
}

export default App
