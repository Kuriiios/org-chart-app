import React from 'react';

interface TopSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const TopSearchBar: React.FC<TopSearchBarProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="relative w-72 ml-5">
      {/* Search icon */}
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0Z" />
      </svg>
      <input
        type="text"
        value={searchTerm}
        onChange={e => onSearchChange(e.target.value)}
        placeholder="Rechercher un collaborateur"
        className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:bg-white transition"
      />
      {/* Clear button — only visible when there is text */}
      {searchTerm && (
        <button
          onClick={() => onSearchChange('')}
          aria-label="Effacer la recherche"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          &#x2715;
        </button>
      )}
    </div>
  );
};

export default TopSearchBar;
