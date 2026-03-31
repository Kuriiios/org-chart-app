// Mock departments data will live here.
// This file will export an array of Department objects.

import type { Department } from '../types/Department';

export const mockDepartments: Department[] = [
  {
    id: 'd1',
    name: 'Direction Générale',
    slug: 'direction-generale',
    colorClass: 'bg-purple-600 text-white',
    badgeClass: 'bg-purple-100 text-purple-800',
  },
  {
    id: 'd2',
    name: 'Technologie',
    slug: 'technologie',
    colorClass: 'bg-blue-600 text-white',
    badgeClass: 'bg-blue-100 text-blue-800',
  },
  {
    id: 'd3',
    name: 'Finance',
    slug: 'finance',
    colorClass: 'bg-green-600 text-white',
    badgeClass: 'bg-green-100 text-green-800',
  },
  {
    id: 'd4',
    name: 'Ressources Humaines',
    slug: 'rh',
    colorClass: 'bg-yellow-500 text-slate-900',
    badgeClass: 'bg-yellow-100 text-yellow-800',
  },
  {
    id: 'd10',
    name: 'Marketing',
    slug: 'marketing',
    colorClass: 'bg-pink-600 text-white',
    badgeClass: 'bg-pink-100 text-pink-800',
  },
  // ── Sub-departments ──────────────────────────────────────────────────────
  {
    id: 'd5',
    name: 'Développement Frontend',
    slug: 'frontend',
    parentId: 'd2',
    colorClass: 'bg-sky-500 text-white',
    badgeClass: 'bg-sky-100 text-sky-800',
  },
  {
    id: 'd6',
    name: 'Développement Backend',
    slug: 'backend',
    parentId: 'd2',
    colorClass: 'bg-indigo-600 text-white',
    badgeClass: 'bg-indigo-100 text-indigo-800',
  },
  {
    id: 'd7',
    name: 'Contrôle de Gestion',
    slug: 'controle-gestion',
    parentId: 'd3',
    colorClass: 'bg-teal-600 text-white',
    badgeClass: 'bg-teal-100 text-teal-800',
  },
  {
    id: 'd8',
    name: 'Comptabilité',
    slug: 'comptabilite',
    parentId: 'd3',
    colorClass: 'bg-emerald-600 text-white',
    badgeClass: 'bg-emerald-100 text-emerald-800',
  },
  {
    id: 'd9',
    name: 'Recrutement & Formation',
    slug: 'recrutement',
    parentId: 'd4',
    colorClass: 'bg-orange-500 text-white',
    badgeClass: 'bg-orange-100 text-orange-800',
  },
];
