import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, X, Leaf, Loader2 } from 'lucide-react';
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
    width: '18px',
    height: '18px',
    color: 'var(--text-secondary)',
    opacity: 0.7,
  },
  input: {
    width: '100%',
    paddingLeft: '48px',
    paddingRight: '48px',
    paddingTop: '12px',
    paddingBottom: '12px',
    backgroundColor: 'var(--glass-bg)',
    backdropFilter: 'blur(var(--glass-blur))',
    WebkitBackdropFilter: 'blur(var(--glass-blur))',
    borderRadius: '16px',
    border: '1px solid var(--glass-border)',
    color: 'var(--text-primary)',
    outline: 'none',
    fontSize: '17px',
    boxShadow: 'var(--glass-shadow)',
    transition: 'all 0.2s ease',
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBadge: {
    position: 'absolute' as const,
    bottom: '-24px',
    left: '0',
    right: '0',
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none' as const,
  },
  badgeText: {
    fontSize: '11px',
    fontWeight: 600,
    backgroundColor: 'var(--accent-green)',
    color: 'white',
    padding: '2px 10px',
    borderRadius: '9999px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.02em',
  },
  dropdown: {
    position: 'absolute' as const,
    top: '100%',
    left: '0',
    right: '0',
    marginTop: '10px',
    backgroundColor: 'var(--glass-bg-elevated)',
    backdropFilter: 'blur(var(--glass-blur))',
    WebkitBackdropFilter: 'blur(var(--glass-blur))',
    borderRadius: '18px',
    boxShadow: 'var(--glass-shadow-elevated)',
    border: '1px solid var(--glass-border)',
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
  emptyState: {
    padding: '32px 16px',
    textAlign: 'center' as const,
    color: 'var(--text-secondary)',
  },
  list: {
    padding: '8px',
    margin: 0,
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  listItem: {
    width: '100%',
    padding: '10px 12px',
    textAlign: 'left' as const,
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    transition: 'background-color 0.2s ease',
  },
  listItemIcon: {
    flexShrink: 0,
    width: '40px',
    height: '40px',
    backgroundColor: 'var(--separator)',
    borderRadius: '10px',
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
    fontWeight: 600,
    color: 'var(--text-primary)',
    fontSize: '16px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  listItemScientific: {
    margin: '1px 0 0 0',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    fontStyle: 'italic' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  listItemCategory: {
    fontSize: '11px',
    fontWeight: 500,
    color: 'var(--text-secondary)',
    backgroundColor: 'var(--separator)',
    padding: '3px 8px',
    borderRadius: '8px',
    textTransform: 'capitalize' as const,
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
          style={{
            ...styles.input,
            borderColor: isOpen ? 'var(--accent-green)' : 'var(--glass-border)',
          }}
        />
        {(query || selectedTypes.length > 0) && (
          <button onClick={handleClear} style={styles.clearButton} aria-label="Clear search">
            <X style={{ width: '20px', height: '20px', color: 'var(--text-tertiary)' }} />
          </button>
        )}
      </div>

      {/* Selected types indicator */}
      {selectedTypes.length > 0 && (
        <div style={styles.selectedBadge}>
          <span style={styles.badgeText}>
            {selectedTypes.length} Active Filter{selectedTypes.length > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Dropdown */}
      {showDropdown && (
        <div style={styles.dropdown} className="glass-elevated">
          {isLoading && (
            <div style={styles.loadingContainer}>
              <Loader2 className="h-6 w-6 animate-spin text-[var(--accent-green)]" />
            </div>
          )}

          {!isLoading && types.length === 0 && (
            <div style={styles.emptyState}>
              <Leaf style={{ width: '32px', height: '32px', margin: '0 auto 12px', color: 'var(--text-tertiary)', opacity: 0.5 }} />
              <p style={{ margin: 0, fontWeight: 500 }}>No results for "{debouncedQuery}"</p>
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
                      backgroundColor: hoveredIndex === index ? 'var(--separator)' : 'transparent',
                    }}
                  >
                    <div style={styles.listItemIcon}>
                      <Leaf style={{ width: '20px', height: '20px', color: 'var(--accent-green)' }} />
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