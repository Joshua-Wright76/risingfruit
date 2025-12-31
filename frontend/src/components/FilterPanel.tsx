import { useState } from 'react';
import { ChevronDown, ChevronUp, Leaf, Flower2, Scissors, ShoppingBag, Calendar } from 'lucide-react';

export interface FilterState {
  categories: string[];
  inSeasonOnly: boolean;
}

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

const CATEGORIES = [
  { id: 'forager', label: 'Forager', icon: Leaf },
  { id: 'honeybee', label: 'Honeybee', icon: Flower2 },
  { id: 'grafter', label: 'Grafter', icon: Scissors },
  { id: 'freegan', label: 'Freegan', icon: ShoppingBag },
] as const;

function getCurrentMonth(): string {
  return new Date().toLocaleString('en-US', { month: 'long' });
}

const styles = {
  container: {
    backgroundColor: '#171717',
    borderRadius: '16px',
    border: '1px solid #404040',
    overflow: 'hidden',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
  },
  toggleButton: {
    width: '100%',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
  } as React.CSSProperties,
  badge: {
    backgroundColor: '#22c55e',
    color: 'white',
    fontSize: '12px',
    fontWeight: 500,
    padding: '2px 8px',
    borderRadius: '9999px',
  },
  expandedContent: {
    padding: '0 16px 16px 16px',
    borderTop: '1px solid #404040',
  },
  sectionTitle: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#737373',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: '8px',
    marginTop: '16px',
  },
  categoryGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
  },
  categoryButton: (isActive: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 12px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 500,
    border: 'none',
    cursor: 'pointer',
    backgroundColor: isActive ? '#16a34a' : '#262626',
    color: isActive ? 'white' : '#d4d4d4',
    transition: 'all 0.15s ease',
  } as React.CSSProperties),
  seasonButton: (isActive: boolean) => ({
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 500,
    border: 'none',
    cursor: 'pointer',
    backgroundColor: isActive ? '#ea580c' : '#262626',
    color: isActive ? 'white' : '#d4d4d4',
    textAlign: 'left' as const,
    transition: 'all 0.15s ease',
  } as React.CSSProperties),
  clearButton: {
    width: '100%',
    padding: '8px',
    marginTop: '12px',
    fontSize: '14px',
    color: '#737373',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
  },
};

export function FilterPanel({ filters, onFilterChange }: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleCategory = (categoryId: string) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter((c) => c !== categoryId)
      : [...filters.categories, categoryId];
    onFilterChange({ ...filters, categories: newCategories });
  };

  const toggleSeasonFilter = () => {
    onFilterChange({ ...filters, inSeasonOnly: !filters.inSeasonOnly });
  };

  const activeFilterCount = filters.categories.length + (filters.inSeasonOnly ? 1 : 0);

  return (
    <div data-testid="filter-panel" style={styles.container}>
      {/* Toggle button */}
      <button onClick={() => setIsExpanded(!isExpanded)} style={styles.toggleButton}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 500, color: '#e5e5e5' }}>Filters</span>
          {activeFilterCount > 0 && (
            <span data-testid="filter-badge" style={styles.badge}>{activeFilterCount}</span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp style={{ width: '20px', height: '20px', color: '#a3a3a3' }} />
        ) : (
          <ChevronDown style={{ width: '20px', height: '20px', color: '#a3a3a3' }} />
        )}
      </button>

      {/* Expanded panel */}
      {isExpanded && (
        <div data-testid="filter-expanded-content" style={styles.expandedContent}>
          {/* Categories */}
          <p data-testid="categories-label" style={styles.sectionTitle}>Categories</p>
          <div style={styles.categoryGrid}>
            {CATEGORIES.map(({ id, label, icon: Icon }) => {
              const isActive = filters.categories.includes(id);
              return (
                <button
                  key={id}
                  data-testid={`category-${id}`}
                  data-active={isActive}
                  onClick={() => toggleCategory(id)}
                  style={styles.categoryButton(isActive)}
                >
                  <Icon style={{ width: '16px', height: '16px', color: isActive ? 'white' : '#737373' }} />
                  {label}
                </button>
              );
            })}
          </div>

          {/* Season filter */}
          <p data-testid="season-label" style={styles.sectionTitle}>Season</p>
          <button data-testid="season-filter" data-active={filters.inSeasonOnly} onClick={toggleSeasonFilter} style={styles.seasonButton(filters.inSeasonOnly)}>
            <Calendar style={{ width: '20px', height: '20px', color: filters.inSeasonOnly ? 'white' : '#737373' }} />
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0 }}>In season now</p>
              <p style={{ 
                margin: '2px 0 0 0', 
                fontSize: '12px', 
                color: filters.inSeasonOnly ? 'rgba(255,255,255,0.7)' : '#737373' 
              }}>
                Showing plants for {getCurrentMonth()}
              </p>
            </div>
          </button>

          {/* Clear button */}
          {activeFilterCount > 0 && (
            <button
              onClick={() => onFilterChange({ categories: [], inSeasonOnly: false })}
              style={styles.clearButton}
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
