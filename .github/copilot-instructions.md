## Plan: React + TS Org Chart App (Vite + Tailwind)

Goal: Build a web-based organizational chart app (overview, carousel, and department-focused views) using React, TypeScript, Vite, and Tailwind CSS, with very small, beginner-friendly steps and clear guidance for state, effects, and a hierarchy library.

### 1. Initial project setup (Vite + Tailwind)

- [ ] Install Node.js LTS if not already installed (from nodejs.org; restart terminal after install).
- [ ] In a terminal, navigate to your workspace folder: `c:\\Users\\cyril.leconte\\Code\\Typescript\\test_2`.
- [ ] Create a new Vite project: `npm create vite@latest org-chart-app -- --template react-ts`.
- [ ] Change into the project folder: `cd org-chart-app`.
- [ ] Install dependencies: `npm install`.
- [ ] Install Tailwind CSS and required tools: `npm install -D tailwindcss postcss autoprefixer`.
- [ ] Initialize Tailwind config files: `npx tailwindcss init -p` (creates `tailwind.config.cjs` and `postcss.config.cjs`).
- [ ] In `tailwind.config.cjs`, set `content` to include Vite paths (e.g., `./index.html`, `./src/**/*.{ts,tsx,js,jsx}`).
- [ ] In `src/index.css` (or `src/main.css` depending on template), add the three Tailwind directives at the top: `@tailwind base;`, `@tailwind components;`, `@tailwind utilities;`.
- [ ] Run the dev server with `npm run dev` and open the URL shown in the terminal to confirm the starter React page works.

### 2. Organize folder and file structure

- [ ] Under `src/`, create these folders:
  - [ ] `src/components/` for reusable React components.
  - [ ] `src/layout/` for layout components like sidebar + main area.
  - [ ] `src/types/` for TypeScript interfaces and types.
  - [ ] `src/data/` for mock data files.
  - [ ] `src/hooks/` (optional, for shared hooks later like search/filter logic).
- [ ] Keep `src/main.tsx` as the entry point which renders the root `App` component.
- [ ] In `src/components/`, plan to create these files (implementation will come later, step by step):
  - [ ] `Sidebar.tsx` – left navigation and department list with counts and filter.
  - [ ] `TopSearchBar.tsx` – global collaborator search bar.
  - [ ] `OrgOverviewView.tsx` – overview (whole-company) hierarchy view.
  - [ ] `OrgCarouselView.tsx` – carousel or grid of “new collaborators”.
  - [ ] `PersonCard.tsx` – small person thumbnail card used inside hierarchies.
  - [ ] `ProfileModal.tsx` – modal showing full collaborator profile.
- [ ] In `src/layout/`, plan to create:
  - [ ] `AppLayout.tsx` – layout with left sidebar and main content area.
- [ ] In `src/types/`, create:
  - [ ] `Collaborator.ts` – will define the `Collaborator` interface.
  - [ ] `Department.ts` – will define a simple department structure.
- [ ] In `src/data/`, create:
  - [ ] `mockCollaborators.ts` – sample company people and relationships.
  - [ ] `mockDepartments.ts` – list of departments and colors.

### 3. Define core TypeScript types

- [ ] Open `src/types/Collaborator.ts` and define a `Collaborator` interface with fields needed for all views and the profile modal, including:
  - [ ] `id: string` – unique identifier.
  - [ ] `firstName: string` and `lastName: string`.
  - [ ] `fullName: string` (optional – can be derived, but having it is simpler for a beginner).
  - [ ] `title: string` (e.g., "Directeur Financier").
  - [ ] `departmentId: string` – links to a department.
  - [ ] `departmentName: string` – for display without extra lookup.
  - [ ] `email: string` – used for `mailto:` link.
  - [ ] `photoUrl: string` – URL or local path for the image.
  - [ ] `managerId?: string` – optional parent in the org tree.
  - [ ] `directReportIds?: string[]` – optional array of IDs of direct reports.
  - [ ] `isNewCollaborator?: boolean` – flag for the carousel view.
- [ ] Add comments explaining each field in beginner-friendly language (you will follow comment-driven development).
- [ ] Open `src/types/Department.ts` and define a `Department` interface:
  - [ ] `id: string` – identifier.
  - [ ] `name: string` – display name (e.g., "Finance").
  - [ ] `slug: string` – simple string for routing/filtering (e.g., `finance`).
  - [ ] `colorClass: string` – Tailwind class for the department color (e.g., `bg-green-500`).
- [ ] Include comments describing that `colorClass` will be used to color department badges, views, and hierarchy accents.

### 4. Create mock data for a small sample company

- [ ] Open `src/data/mockDepartments.ts` and export a small array like 3–5 departments (e.g., Direction Générale, Technologie, Finance, RH):
  - [ ] Each department should have matching `id`, `name`, `slug`, and a Tailwind color class.
- [ ] Open `src/data/mockCollaborators.ts` and export an array of `Collaborator`:
  - [ ] Start small: 6–10 people total.
  - [ ] Include at least:
    - [ ] One CEO / Director Général at the top (no `managerId`).
    - [ ] 2–3 direct reports for different departments (e.g., CTO for Tech, CFO for Finance).
    - [ ] A few additional employees under the CFO/CTO to show 2–3 levels.
  - [ ] Use realistic names and titles (e.g., Jean Moreau as Directeur Financier, with some direct reports).
  - [ ] Fill `departmentId` and `departmentName` consistently.
  - [ ] Set some collaborators `isNewCollaborator: true` for the carousel view.
  - [ ] Ensure `directReportIds` for managers match `id` values of their team members.
- [ ] Add clear comments at the top of each mock file explaining that this is temporary data that simulates a real backend.

### 5. Wire mock data into the root App component

- [ ] Open `src/App.tsx` and simplify it to be the central place that:
  - [ ] Imports `mockCollaborators` and `mockDepartments`.
  - [ ] Passes these as props into `AppLayout` (which will handle layout and view switching).
- [ ] For now, do not worry about routing libraries – use simple internal state to switch between views.
- [ ] Add a top-level state variable for the current view, e.g., `"overview" | "carousel" | "department"`.
- [ ] Add a top-level state variable for `selectedDepartmentId` (string or `null`).
- [ ] Keep the layout simple: App → AppLayout → Sidebar + MainContent.

### 6. Build the layout skeleton (without real data yet)

- [ ] Create `src/layout/AppLayout.tsx` with a simple two-column Tailwind layout:
  - [ ] Left column: fixed-width sidebar (e.g., `w-64`, `bg-slate-900`, `text-white`).
  - [ ] Right column: flexible main content area (`flex-1`, `bg-slate-50`, `p-6`).
- [ ] In `AppLayout`, accept props: `departments`, `collaborators`, `currentView`, `onChangeView`, `selectedDepartmentId`, `onSelectDepartment`, `selectedCollaborator`, `onSelectCollaborator`.
- [ ] Inside `AppLayout`, render:
  - [ ] A `Sidebar` component in the left column.
  - [ ] A header area at the top of the right column with `TopSearchBar` and buttons/tabs to switch between "Overview", "Carousel", and "Department" views.
  - [ ] A main content section that conditionally renders one of `OrgOverviewView` or `OrgCarouselView` based on `currentView`.
- [ ] Style using Tailwind utility classes, starting simple (you can refine styling later).

### 7. Implement the Sidebar with searchable/filterable departments

- [ ] In `src/components/Sidebar.tsx`, start with a basic vertical layout:
  - [ ] A title (e.g., "Départements").
  - [ ] A search input field for filtering department names.
  - [ ] A scrollable list of department items.
- [ ] Define props for `Sidebar`:
  - [ ] `departments` array.
  - [ ] `collaborators` array (to compute counts per department).
  - [ ] `selectedDepartmentId`.
  - [ ] `onSelectDepartment` callback.
- [ ] Use `useState` inside `Sidebar` to manage `departmentSearchTerm` (a string):
  - [ ] Initialize with an empty string: `const [searchTerm, setSearchTerm] = useState("")`.
  - [ ] Add an `onChange` handler to the input: when the user types, update `searchTerm`.
- [ ] Derive `filteredDepartments` by filtering the `departments` prop:
  - [ ] Convert both department names and `searchTerm` to lowercase and check `includes`.
  - [ ] Do this filtering directly inside the render or with a small helper function.
- [ ] For each department in `filteredDepartments`, compute the number of collaborators:
  - [ ] `const count = collaborators.filter(c => c.departmentId === department.id).length`.
- [ ] Render each item as a clickable row:
  - [ ] Show department name and count (e.g., "Finance (3)").
  - [ ] Highlight the selected item using the department color or a Tailwind class (e.g., different background when `department.id === selectedDepartmentId`).
- [ ] Explain `useState` in this context:
  - [ ] `useState` is how you remember values between renders (like the current search text).
  - [ ] When `setSearchTerm` is called, React will re-render the component with the new state, and the filtered list automatically updates.

### 8. Add the top search bar for collaborators

- [ ] In `src/components/TopSearchBar.tsx`, create a simple input field.
- [ ] Accept props: `searchTerm`, `onSearchChange`.
- [ ] Manage the actual state in a higher-level component (e.g., `App` or `AppLayout`) so the search can affect multiple views if needed.
- [ ] In `App` or `AppLayout`, use `useState` to store `collaboratorSearchTerm`:
  - [ ] `const [collaboratorSearchTerm, setCollaboratorSearchTerm] = useState("")`.
  - [ ] Pass both value and setter down to `TopSearchBar`.
- [ ] Filter collaborators in relevant views (overview, carousel, department) by this search term, matching either `fullName`, `title`, or `departmentName`.
- [ ] Explain how `useState` flows from parent to child via props and how children notify the parent using callbacks.

### 9. Implement the simplest static PersonCard first (comment-driven)

- [ ] In `src/components/PersonCard.tsx`, start with **no props** and hard-coded content to keep it simple:
  - [ ] Add comments like: `// TODO: replace hard-coded data with props later`.
  - [ ] Render a card with:
    - [ ] Placeholder image (e.g., using a static image or Tailwind avatar-style div).
    - [ ] Name, title, department badge, small email text.
- [ ] Add Tailwind styling for spacing, shadows, border radius, and hover effect.
- [ ] Once the static card looks right, refactor to accept props typed with `Collaborator`:
  - [ ] `interface PersonCardProps { collaborator: Collaborator; onClick?: (collaborator: Collaborator) => void; }`.
  - [ ] Replace hard-coded values with `collaborator.fullName`, `collaborator.title`, etc.
  - [ ] Attach `onClick` to the card root to allow opening the modal later.

### 10. Implement the ProfileModal component

- [ ] In `src/components/ProfileModal.tsx`, design props:
  - [ ] `collaborator: Collaborator | null` – the currently selected person.
  - [ ] `manager: Collaborator | null` – the collaborator’s manager (if any).
  - [ ] `directReports: Collaborator[]` – direct reports (if any).
  - [ ] `departmentColorClass: string` – color from the department.
  - [ ] `isOpen: boolean` and `onClose: () => void`.
- [ ] Render nothing (return `null`) when `isOpen` is false or `collaborator` is null.
- [ ] When open, render a full-screen semi-transparent overlay with a centered modal panel.
- [ ] Inside the modal, show:
  - [ ] Large photo (`img` using `collaborator.photoUrl`).
  - [ ] Full name and title.
  - [ ] Department badge styled with `departmentColorClass`.
  - [ ] Email as a clickable `mailto:` link.
  - [ ] A small section for manager: photo + name (if `manager` is not null).
  - [ ] A list of direct reports (thumbnails or names) if `directReports` is not empty.
- [ ] Manage `isOpen` and `selectedCollaboratorId` in a higher-level component (`App` or `AppLayout`) using `useState`:
  - [ ] When a `PersonCard` is clicked, set `selectedCollaboratorId` and `isModalOpen` to true.
  - [ ] Look up the `manager` and `directReports` using `mockCollaborators` based on IDs.
- [ ] Explain that this pattern (lifting state up for the modal) is important: the modal needs access to global data, so state lives at the app level, not inside each card.

### 11. Add view switching and basic main views (no hierarchy library yet)

- [ ] In `App` or `AppLayout`, implement simple view tabs or buttons (e.g., three buttons labelled "Overview", "Nouveaux collaborateurs", "Département").
- [ ] Store the current view in a `useState` variable, e.g., `const [currentView, setCurrentView] = useState<"overview" | "carousel" | "department">("overview")`.
- [ ] For the **Overview** view (`OrgOverviewView`):
  - [ ] Start with a simple layout (no real connecting lines yet):
    - [ ] Show the top-level person(s) (no manager) at the top.
    - [ ] Below, group cards by department or by manager.
  - [ ] Accept props: `collaborators`, `onSelectCollaborator`, `searchTerm`.
  - [ ] Filter collaborators by `searchTerm` first.
- [ ] For the **Carousel** view (`OrgCarouselView`):
  - [ ] Show only collaborators where `isNewCollaborator` is true.
  - [ ] Start with a responsive grid of `PersonCard`, then later upgrade to a real carousel if desired (e.g., using Swiper, but this can be optional).
  - [ ] Accept props: `collaborators`, `onSelectCollaborator`.
- [ ] Ensure clicking cards in any view opens the `ProfileModal` with correct data.

### 12. Introduce `useEffect` for simulated data loading

- [ ] Until now, you imported mock data directly. To learn `useEffect`, simulate loading data:
  - [ ] In `App`, instead of using `mockCollaborators` directly as a constant, create state:
    - [ ] `const [collaborators, setCollaborators] = useState<Collaborator[]>([])`.
    - [ ] `const [departments, setDepartments] = useState<Department[]>([])`.
  - [ ] Use `useEffect` with an empty dependency array `[]` to simulate fetching on component mount:
    - [ ] Inside `useEffect`, set a timeout (e.g., `setTimeout`) that calls `setCollaborators(mockCollaborators)` and `setDepartments(mockDepartments)` after a short delay.
- [ ] Explain the meaning of `useEffect`:
  - [ ] `useEffect` lets you run side effects after the component renders.
  - [ ] With `[]` as dependencies, it runs only once, similar to `componentDidMount` in class components.
  - [ ] This pattern mimics fetching from an API and prepares you for real backends later.
- [ ] Add a loading state: `const [isLoading, setIsLoading] = useState(true)` and set it to false after the timeout.
- [ ] Show a simple loading message in the main content when `isLoading` is true.

### 13. Choose and plan a hierarchy / org chart library

- [ ] For beginner-friendly, consider using **React Flow** (reactflow.dev) for interactive graphs:
  - [ ] It supports zooming, panning, and connecting nodes with edges.
  - [ ] Has good TypeScript support and many examples.
- [ ] Alternatively, for a simpler static tree, consider **react-organizational-chart**:
  - [ ] Easier for simple hierarchies but less interactive.
- [ ] For this project, plan to start with `react-organizational-chart` for basic layout, then optionally progress to React Flow if you want more interaction.
- [ ] Add to your plan (later steps) to install: `npm install react-organizational-chart`.
- [ ] Read the documentation and identify the basic components you need (e.g., `Tree` and `TreeNode`).

### 14. Implement a basic hierarchy with `react-organizational-chart` in the Overview view

- [ ] Install the library: `npm install react-organizational-chart`.
- [ ] In `OrgOverviewView`, replace the simple list layout with a hierarchy tree:
  - [ ] Identify the root collaborator(s) – those with no `managerId`.
  - [ ] Build a helper function that, given a `Collaborator`, finds their direct reports using `directReportIds` or by filtering on `managerId`.
  - [ ] Recursively render a `TreeNode` for each collaborator, nesting their direct reports as children.
- [ ] Style each node by rendering your `PersonCard` (possibly in a simplified form) inside the `TreeNode`.
- [ ] Ensure clicking a node still opens the profile modal.
- [ ] Apply horizontal orientation if supported, or adjust CSS to visually approximate the wide, horizontal company view.

### 15. Implement department-specific hierarchy view

- [ ] Apply the department color (from `Department.colorClass`) to:
  - [ ] Card borders or backgrounds.
  - [ ] Connecting line styles if supported by the library.
- [ ] Make sure the hierarchy root is the department head (e.g., the collaborator whose `title` or `managerId` indicates leadership in that department).

### 16. Refine interactions and UX

- [ ] Add keyboard accessibility to close the modal using the Escape key.
- [ ] Add focus trapping for the modal if possible (so tabbing stays inside when open).
- [ ] Improve hover states for sidebar items and cards.
- [ ] Ensure the app looks good on larger screens (horizontal space) for the org chart.

### 17. Comment-driven development guidance

- [ ] Before writing each component, start by writing high-level comments:
  - [ ] At the top: `// Component: Sidebar – shows departments, counts, and filter`.
  - [ ] Inside: `// State: department search term`, `// Derived: filtered departments`.
  - [ ] For handlers: `// When user clicks a department, notify parent via onSelectDepartment`.
- [ ] Use comments in TypeScript interfaces:
  - [ ] Explain what each field means and give an example value.
- [ ] As you implement each TODO, remove or refine the comment so the code stays readable but still beginner-friendly.

### 18. Final polishing and checks

- [ ] Test the flow:
  - [ ] Filter departments via the sidebar and confirm the department view updates.
  - [ ] Use the top search bar to find collaborators and ensure all views respect the filter.
  - [ ] Click different nodes in the overview and department hierarchies to open the profile modal.
  - [ ] Confirm manager and direct reports show correctly in the modal.
- [ ] Tweak Tailwind classes to visually approximate your target design (color themes per department, card shadows, spacing).
- [ ] Consider extracting repeated logic (e.g., finding manager/direct reports, building hierarchy trees) into small utility functions in a new `src/utils/orgHelpers.ts` file for cleanliness.

### Relevant files

- `org-chart-app/vite.config.ts` — Vite configuration (usually minimal changes needed).
- `org-chart-app/tailwind.config.cjs` — Tailwind configuration with content paths.
- `org-chart-app/src/main.tsx` — Entry point that renders `App`.
- `org-chart-app/src/App.tsx` — Root component managing global state (views, selected department, modal state).
- `org-chart-app/src/layout/AppLayout.tsx` — Two-column layout (sidebar + main content).
- `org-chart-app/src/components/Sidebar.tsx` — Department list with search and counts.
- `org-chart-app/src/components/TopSearchBar.tsx` — Global collaborator search bar.
- `org-chart-app/src/components/OrgOverviewView.tsx` — Whole-company hierarchy view.
- `org-chart-app/src/components/OrgCarouselView.tsx` — New collaborators carousel/grid view.
- `org-chart-app/src/components/PersonCard.tsx` — Small card for individuals.
- `org-chart-app/src/components/ProfileModal.tsx` — Detailed collaborator profile modal.
- `org-chart-app/src/types/Collaborator.ts` — TypeScript interface for collaborators.
- `org-chart-app/src/types/Department.ts` — TypeScript interface for departments.
- `org-chart-app/src/data/mockCollaborators.ts` — Mock data for collaborators.
- `org-chart-app/src/data/mockDepartments.ts` — Mock data for departments.

### Verification

- [ ] Run `npm run dev` and confirm the basic layout (sidebar + main content) appears without TypeScript errors.
- [ ] Verify the sidebar filter updates the department list as you type and the counts make sense based on mock data.
- [ ] Confirm the top search bar filters collaborators across views.
- [ ] Ensure clicking any `PersonCard` opens the profile modal with correct manager and direct reports.
- [ ] Validate the overview and department views show sensible hierarchies using the chosen library.
- [ ] Manually compare the UI against your reference images, adjusting colors, spacing, and fonts with Tailwind as needed.

### Decisions

- Use Vite + React + TypeScript + Tailwind CSS for fast, modern setup.
- Use comment-driven development: always add comments/TODOs before writing logic.
- Start with mock in-memory data (no backend) and simulate loading with `useEffect`.
- Choose `react-organizational-chart` as the first hierarchy library for easier tree visualization, with the option to upgrade to React Flow later.

### Further Considerations

- If you later add routing (e.g., React Router), you can map each view (overview, carousel, department) to its own route while reusing the same components.
- You can replace mock photos with real avatar URLs or a service like UI Avatars once you have real data.
- When comfortable, you can introduce a real backend or API to load collaborators and departments, reusing the same `useEffect` patterns you practiced here.
