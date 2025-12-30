import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, X, Leaf } from 'lucide-react';
import { getTypes } from '../lib/api';
import type { PlantType } from '../types/location';

interface SearchBarProps {
  selectedTypes: number[];
  onSelectType: (type: PlantType) => void;
  onClearTypes: () => void;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export function SearchBar({ selectedTypes, onSelectType, onClearTypes }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  const { data, isLoading } = useQuery({
    queryKey: ['types', 'search', debouncedQuery],
    queryFn: () => getTypes({ search: debouncedQuery }),
    enabled: debouncedQuery.length >= 2,
    staleTime: 60000, // Cache for 1 minute
  });

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = useCallback((type: PlantType) => {
    onSelectType(type);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  }, [onSelectType]);

  const handleClear = useCallback(() => {
    setQuery('');
    onClearTypes();
    inputRef.current?.focus();
  }, [onClearTypes]);

  const showDropdown = isOpen && debouncedQuery.length >= 2;
  const types = data?.types || [];

  return (
    <div ref={containerRef} className="relative">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-500" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search plants..."
          className="w-full pl-12 pr-12 py-3 bg-surface-900 rounded-2xl shadow-lg border border-surface-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-surface-100 placeholder-surface-500 outline-none transition-colors"
        />
        {(query || selectedTypes.length > 0) && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-surface-700 transition-colors"
            aria-label="Clear search"
          >
            <X className="h-5 w-5 text-surface-400" />
          </button>
        )}
      </div>

      {/* Selected types indicator */}
      {selectedTypes.length > 0 && (
        <div className="absolute -bottom-7 left-0 right-0 flex justify-center">
          <span className="text-xs bg-primary-900/80 text-primary-300 px-3 py-1 rounded-full border border-primary-700">
            Filtering by {selectedTypes.length} type{selectedTypes.length > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface-900 rounded-2xl shadow-xl border border-surface-700 overflow-hidden z-50 max-h-80 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
            </div>
          )}

          {!isLoading && types.length === 0 && (
            <div className="py-8 text-center text-surface-400">
              <Leaf className="h-8 w-8 mx-auto mb-2 text-surface-600" />
              <p>No plants found for "{debouncedQuery}"</p>
            </div>
          )}

          {!isLoading && types.length > 0 && (
            <ul className="py-2">
              {types.slice(0, 20).map((type) => (
                <li key={type.id}>
                  <button
                    onClick={() => handleSelect(type)}
                    className="w-full px-4 py-3 text-left hover:bg-surface-800 transition-colors flex items-center gap-3"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-primary-900/50 rounded-lg flex items-center justify-center">
                      <Leaf className="h-5 w-5 text-primary-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-surface-100 truncate">{type.en_name}</p>
                      {type.scientific_name && (
                        <p className="text-sm text-surface-500 italic truncate">
                          {type.scientific_name}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-surface-500 bg-surface-800 px-2 py-1 rounded-full">
                      {type.category_mask.split(', ')[0]}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
