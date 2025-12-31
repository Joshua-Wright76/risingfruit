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

const styles = {
  container: {
    position: 'relative' as const,
  },
  inputWrapper: {
    position: 'relative' as const,
  },
  searchIcon: {
    position: 'absolute' as const,
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '20px',
    height: '20px',
    color: '#737373',
  },
  input: {
    width: '100%',
    paddingLeft: '48px',
    paddingRight: '48px',
    paddingTop: '12px',
    paddingBottom: '12px',
    backgroundColor: '#171717',
    borderRadius: '16px',
    border: '1px solid #404040',
    color: '#f5f5f5',
    outline: 'none',
    fontSize: '16px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
  },
  clearButton: {
    position: 'absolute' as const,
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    padding: '6px',
    borderRadius: '9999px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
  },
  selectedBadge: {
    position: 'absolute' as const,
    bottom: '-28px',
    left: '0',
    right: '0',
    display: 'flex',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: '12px',
    backgroundColor: 'rgba(22, 101, 52, 0.8)',
    color: '#86efac',
    padding: '4px 12px',
    borderRadius: '9999px',
    border: '1px solid #166534',
  },
  dropdown: {
    position: 'absolute' as const,
    top: '100%',
    left: '0',
    right: '0',
    marginTop: '8px',
    backgroundColor: '#171717',
    borderRadius: '16px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    border: '1px solid #404040',
    overflow: 'hidden',
    zIndex: 50,
    maxHeight: '320px',
    overflowY: 'auto' as const,
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 0',
  },
  spinner: {
    width: '24px',
    height: '24px',
    border: '2px solid transparent',
    borderTop: '2px solid #22c55e',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  emptyState: {
    padding: '32px 16px',
    textAlign: 'center' as const,
    color: '#a3a3a3',
  },
  list: {
    padding: '8px 0',
    margin: 0,
    listStyle: 'none',
  },
  listItem: {
    width: '100%',
    padding: '12px 16px',
    textAlign: 'left' as const,
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    transition: 'background-color 0.15s ease',
  },
  listItemIcon: {
    flexShrink: 0,
    width: '40px',
    height: '40px',
    backgroundColor: 'rgba(22, 101, 52, 0.5)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listItemContent: {
    flex: 1,
    minWidth: 0,
  },
  listItemName: {
    margin: 0,
    fontWeight: 500,
    color: '#f5f5f5',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  listItemScientific: {
    margin: '2px 0 0 0',
    fontSize: '14px',
    color: '#737373',
    fontStyle: 'italic' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  listItemCategory: {
    fontSize: '12px',
    color: '#737373',
    backgroundColor: '#262626',
    padding: '4px 8px',
    borderRadius: '9999px',
  },
};

export function SearchBar({ selectedTypes, onSelectType, onClearTypes }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  const { data, isLoading } = useQuery({
    queryKey: ['types', 'search', debouncedQuery],
    queryFn: () => getTypes({ search: debouncedQuery }),
    enabled: debouncedQuery.length >= 2,
    staleTime: 60000,
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
    <div ref={containerRef} style={styles.container}>
      {/* Spinner keyframes */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      
      {/* Search input */}
      <div style={styles.inputWrapper}>
        <Search style={styles.searchIcon} />
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
          style={styles.input}
        />
        {(query || selectedTypes.length > 0) && (
          <button onClick={handleClear} style={styles.clearButton} aria-label="Clear search">
            <X style={{ width: '20px', height: '20px', color: '#a3a3a3' }} />
          </button>
        )}
      </div>

      {/* Selected types indicator */}
      {selectedTypes.length > 0 && (
        <div style={styles.selectedBadge}>
          <span style={styles.badgeText}>
            Filtering by {selectedTypes.length} type{selectedTypes.length > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Dropdown */}
      {showDropdown && (
        <div style={styles.dropdown}>
          {isLoading && (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner} />
            </div>
          )}

          {!isLoading && types.length === 0 && (
            <div style={styles.emptyState}>
              <Leaf style={{ width: '32px', height: '32px', margin: '0 auto 8px', color: '#525252' }} />
              <p style={{ margin: 0 }}>No plants found for "{debouncedQuery}"</p>
            </div>
          )}

          {!isLoading && types.length > 0 && (
            <ul style={styles.list}>
              {types.slice(0, 20).map((type, index) => (
                <li key={type.id}>
                  <button
                    onClick={() => handleSelect(type)}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    style={{
                      ...styles.listItem,
                      backgroundColor: hoveredIndex === index ? '#262626' : 'transparent',
                    }}
                  >
                    <div style={styles.listItemIcon}>
                      <Leaf style={{ width: '20px', height: '20px', color: '#4ade80' }} />
                    </div>
                    <div style={styles.listItemContent}>
                      <p style={styles.listItemName}>{type.en_name}</p>
                      {type.scientific_name && (
                        <p style={styles.listItemScientific}>{type.scientific_name}</p>
                      )}
                    </div>
                    {type.category_mask && (
                      <span style={styles.listItemCategory}>
                        {type.category_mask.split(', ')[0]}
                      </span>
                    )}
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
