import { useState } from 'react';
import { Paper, Button, Collapse, Text, Badge, Box, UnstyledButton, Group } from '@mantine/core';
import { ChevronDown, ChevronUp, Calendar } from 'lucide-react';

export interface FilterState {
  inSeasonOnly: boolean;
}

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

function getCurrentMonth(): string {
  return new Date().toLocaleString('en-US', { month: 'long' });
}

export function FilterPanel({ filters, onFilterChange }: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSeasonFilter = () => {
    onFilterChange({ ...filters, inSeasonOnly: !filters.inSeasonOnly });
  };

  const activeFilterCount = filters.inSeasonOnly ? 1 : 0;

  return (
    <Paper
      data-testid="filter-panel"
      shadow="md"
      radius="lg"
      style={{
        backgroundColor: 'rgba(23, 23, 23, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(64, 64, 64, 0.5)',
        overflow: 'hidden',
      }}
    >
      {/* Toggle button */}
      <UnstyledButton
        onClick={() => setIsExpanded(!isExpanded)}
        w="100%"
        p="12px 16px"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Group gap={10}>
          <Text fw={600} c="gray.0" size="md">Filters</Text>
          {activeFilterCount > 0 && (
            <Badge
              data-testid="filter-badge"
              color="primary.5"
              variant="filled"
              size="sm"
              radius="xl"
              styles={{ root: { minWidth: 18, height: 18, padding: '0 4px' } }}
            >
              {activeFilterCount}
            </Badge>
          )}
        </Group>
        {isExpanded ? (
          <ChevronUp style={{ width: 20, height: 20, color: 'var(--mantine-color-gray-5)' }} />
        ) : (
          <ChevronDown style={{ width: 20, height: 20, color: 'var(--mantine-color-gray-5)' }} />
        )}
      </UnstyledButton>

      {/* Expanded panel */}
      <Collapse in={isExpanded}>
        <Box
          data-testid="filter-expanded-content"
          p="0 16px 16px 16px"
          style={{ borderTop: '1px solid var(--mantine-color-surface-8)' }}
        >
          {/* Season filter */}
          <Text
            data-testid="season-label"
            size="xs"
            fw={600}
            c="gray.5"
            tt="uppercase"
            style={{ letterSpacing: '0.05em' }}
            mt={16}
            mb={8}
          >
            Season
          </Text>
          <UnstyledButton
            data-testid="season-filter"
            data-active={filters.inSeasonOnly}
            onClick={toggleSeasonFilter}
            w="100%"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 600,
              backgroundColor: filters.inSeasonOnly ? 'var(--mantine-color-accent-5)' : 'var(--mantine-color-surface-8)',
              color: filters.inSeasonOnly ? 'white' : 'var(--mantine-color-gray-0)',
              textAlign: 'left',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <Calendar style={{ width: 20, height: 20, color: filters.inSeasonOnly ? 'white' : 'var(--mantine-color-gray-5)' }} />
            <div style={{ flex: 1 }}>
              <Text size="sm" fw={600} lh={1.2}>In season now</Text>
              <Text
                size="xs"
                fw={500}
                mt={2}
                c={filters.inSeasonOnly ? 'rgba(255,255,255,0.8)' : 'gray.5'}
              >
                {getCurrentMonth()} harvest
              </Text>
            </div>
          </UnstyledButton>

          {/* Clear button */}
          {activeFilterCount > 0 && (
            <Button
              variant="subtle"
              fullWidth
              mt={12}
              radius="lg"
              color="red"
              onClick={() => onFilterChange({ inSeasonOnly: false })}
              styles={{
                root: {
                  backgroundColor: 'var(--mantine-color-surface-8)',
                  fontWeight: 600,
                },
              }}
            >
              Reset Filters
            </Button>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
}
