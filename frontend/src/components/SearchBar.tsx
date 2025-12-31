import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TextInput, Paper, Box, Text, Badge, Loader, UnstyledButton, Center, Stack } from '@mantine/core';
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
    <Box ref={containerRef} pos="relative">
      {/* Search input */}
      <Box pos="relative">
        <TextInput
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search plants..."
          leftSection={<Search size={18} style={{ opacity: 0.7 }} />}
          rightSection={
            (query || selectedTypes.length > 0) ? (
              <UnstyledButton onClick={handleClear} aria-label="Clear search" p={6}>
                <X size={20} style={{ color: 'var(--mantine-color-gray-5)' }} />
              </UnstyledButton>
            ) : null
          }
          size="md"
          radius="lg"
          styles={{
            input: {
              backgroundColor: 'rgba(23, 23, 23, 0.85)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: `1px solid ${isOpen ? 'var(--mantine-color-primary-5)' : 'rgba(64, 64, 64, 0.5)'}`,
              color: 'var(--mantine-color-gray-0)',
              fontSize: 17,
              height: 48,
              paddingLeft: 48,
              paddingRight: 48,
              transition: 'border-color 0.2s ease',
              '&::placeholder': {
                color: 'var(--mantine-color-gray-5)',
              },
            },
            section: {
              color: 'var(--mantine-color-gray-5)',
            },
          }}
        />
      </Box>

      {/* Selected types indicator */}
      {selectedTypes.length > 0 && (
        <Box
          pos="absolute"
          bottom={-24}
          left={0}
          right={0}
          style={{ display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}
        >
          <Badge
            color="primary.5"
            variant="filled"
            size="sm"
            radius="xl"
            tt="uppercase"
            style={{ letterSpacing: '0.02em', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
          >
            {selectedTypes.length} Active Filter{selectedTypes.length > 1 ? 's' : ''}
          </Badge>
        </Box>
      )}

      {/* Dropdown */}
      {showDropdown && (
        <Paper
          pos="absolute"
          top="100%"
          left={0}
          right={0}
          mt={10}
          radius="lg"
          shadow="xl"
          style={{
            backgroundColor: 'rgba(38, 38, 38, 0.95)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(64, 64, 64, 0.5)',
            overflow: 'hidden',
            zIndex: 50,
            maxHeight: 320,
            overflowY: 'auto',
          }}
        >
          {isLoading && (
            <Center py={32}>
              <Loader color="primary.5" size="md" />
            </Center>
          )}

          {!isLoading && types.length === 0 && (
            <Center py={32} px={16}>
              <Stack align="center" gap={12}>
                <Leaf size={32} style={{ color: 'var(--mantine-color-gray-6)', opacity: 0.5 }} />
                <Text c="gray.5" fw={500}>No results for "{debouncedQuery}"</Text>
              </Stack>
            </Center>
          )}

          {!isLoading && types.length > 0 && (
            <Stack gap={4} p={8}>
              {types.slice(0, 20).map((type) => (
                <UnstyledButton
                  key={type.id}
                  onClick={() => handleSelect(type)}
                  w="100%"
                  p="10px 12px"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    borderRadius: 12,
                    transition: 'background-color 0.15s ease',
                  }}
                  styles={{
                    root: {
                      '&:hover': {
                        backgroundColor: 'var(--mantine-color-surface-8)',
                      },
                    },
                  }}
                >
                  <Box
                    style={{
                      flexShrink: 0,
                      width: 40,
                      height: 40,
                      backgroundColor: 'var(--mantine-color-surface-8)',
                      borderRadius: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Leaf size={20} style={{ color: 'var(--mantine-color-primary-5)' }} />
                  </Box>
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      fw={600}
                      c="gray.0"
                      size="md"
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {type.en_name}
                    </Text>
                    {type.scientific_name && (
                      <Text
                        size="sm"
                        c="gray.5"
                        fs="italic"
                        mt={1}
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {type.scientific_name}
                      </Text>
                    )}
                  </Box>
                  {type.category_mask && (
                    <Badge
                      variant="light"
                      color="gray"
                      size="sm"
                      radius="md"
                      tt="capitalize"
                      styles={{
                        root: {
                          backgroundColor: 'var(--mantine-color-surface-8)',
                          color: 'var(--mantine-color-gray-5)',
                        },
                      }}
                    >
                      {type.category_mask.split(', ')[0]}
                    </Badge>
                  )}
                </UnstyledButton>
              ))}
            </Stack>
          )}
        </Paper>
      )}
    </Box>
  );
}
