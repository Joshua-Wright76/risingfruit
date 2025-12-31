import { Paper, Box, Text, Button, Center, Stack } from '@mantine/core';
import { MapPin, FilterX } from 'lucide-react';

interface EmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

export function EmptyState({ hasFilters, onClearFilters }: EmptyStateProps) {
  return (
    <Box
      pos="absolute"
      bottom={96}
      left={16}
      right={16}
      style={{ zIndex: 10, pointerEvents: 'none' }}
    >
      <Paper
        p={24}
        radius="lg"
        shadow="lg"
        maw={400}
        mx="auto"
        style={{
          backgroundColor: 'rgba(38, 38, 38, 0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(64, 64, 64, 0.5)',
          pointerEvents: 'auto',
        }}
      >
        <Stack align="center" gap={0}>
          <Center
            w={56}
            h={56}
            mb={16}
            style={{
              backgroundColor: 'var(--mantine-color-surface-8)',
              borderRadius: '50%',
            }}
          >
            <MapPin size={28} style={{ color: 'var(--mantine-color-gray-5)' }} />
          </Center>
          
          <Text size="lg" fw={700} c="gray.0" mb={8}>
            No locations found
          </Text>
          
          <Text size="sm" c="gray.5" ta="center" fw={500} mb={24} maw={280}>
            {hasFilters
              ? "Try adjusting your filters or search to see more results."
              : "Try zooming out or panning to a different area."}
          </Text>
          
          {hasFilters && (
            <Button
              onClick={onClearFilters}
              leftSection={<FilterX size={16} />}
              color="primary.5"
              radius="lg"
              size="md"
              fw={700}
              styles={{
                root: {
                  boxShadow: '0 4px 14px rgba(34, 197, 94, 0.2)',
                },
              }}
            >
              Reset Filters
            </Button>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
