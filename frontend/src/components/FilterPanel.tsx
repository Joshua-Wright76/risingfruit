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
    backgroundColor: 'var(--glass-bg)',
    backdropFilter: 'blur(var(--glass-blur))',
    WebkitBackdropFilter: 'blur(var(--glass-blur))',
    borderRadius: '16px',
    border: '1px solid var(--glass-border)',
    overflow: 'hidden',
    boxShadow: 'var(--glass-shadow)',
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
    backgroundColor: 'var(--accent-green)',
    color: 'white',
    fontSize: '11px',
    fontWeight: 700,
    minWidth: '18px',
    height: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px',
    borderRadius: '9999px',
  },
  expandedContent: {
    padding: '0 16px 16px 16px',
    borderTop: '1px solid var(--separator)',
  },
  sectionTitle: {
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
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
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    backgroundColor: isActive ? 'var(--accent-green)' : 'var(--separator)',
    color: isActive ? 'white' : 'var(--text-primary)',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  } as React.CSSProperties),
  seasonButton: (isActive: boolean) => ({
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    backgroundColor: isActive ? 'var(--accent-orange)' : 'var(--separator)',
    color: isActive ? 'white' : 'var(--text-primary)',
    textAlign: 'left' as const,
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  } as React.CSSProperties),
  clearButton: {
    width: '100%',
    padding: '10px',
    marginTop: '12px',
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--accent-red)',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '12px',
    backgroundColor: 'var(--separator)',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '16px' }}>Filters</span>
          {activeFilterCount > 0 && (
            <span data-testid="filter-badge" style={styles.badge}>{activeFilterCount}</span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp style={{ width: '20px', height: '20px', color: 'var(--text-tertiary)' }} />
        ) : (
          <ChevronDown style={{ width: '20px', height: '20px', color: 'var(--text-tertiary)' }} />
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
                  <Icon style={{ width: '16px', height: '16px', color: isActive ? 'white' : 'var(--text-secondary)' }} />
                  {label}
                </button>
              );
            })}
          </div>

          {/* Season filter */}
          <p data-testid="season-label" style={styles.sectionTitle}>Season</p>
          <button data-testid="season-filter" data-active={filters.inSeasonOnly} onClick={toggleSeasonFilter} style={styles.seasonButton(filters.inSeasonOnly)}>
            <Calendar style={{ width: '20px', height: '20px', color: filters.inSeasonOnly ? 'white' : 'var(--text-secondary)' }} />
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0 }}>In season now</p>
              <p style={{ 
                margin: '2px 0 0 0', 
                fontSize: '12px', 
                fontWeight: 500,
                color: filters.inSeasonOnly ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)' 
              }}>
                {getCurrentMonth()} harvest
              </p>
            </div>
          </button>

          {/* Clear button */}
          {activeFilterCount > 0 && (
            <button
              onClick={() => onFilterChange({ categories: [], inSeasonOnly: false })}
              style={styles.clearButton}
            >
              Reset Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}