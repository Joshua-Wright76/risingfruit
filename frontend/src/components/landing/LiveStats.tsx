import { useQuery } from '@tanstack/react-query';
import { Container, SimpleGrid, Paper, Text, Stack, Box, Skeleton } from '@mantine/core';
import { MapPin, CheckCircle, TreePine } from 'lucide-react';
import { getStats } from '../../lib/api';

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M+';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(0) + 'K+';
  }
  return num.toLocaleString();
}

const statConfigs = [
  {
    key: 'locations_total',
    label: 'Foraging Locations',
    icon: MapPin,
    color: 'primary',
  },
  {
    key: 'locations_verified',
    label: 'Verified Spots',
    icon: CheckCircle,
    color: 'primary',
  },
  {
    key: 'types_total',
    label: 'Plant Types',
    icon: TreePine,
    color: 'accent',
  },
] as const;

export function LiveStats() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['stats'],
    queryFn: getStats,
    staleTime: 60000, // Cache for 1 minute
  });

  return (
    <Box
      component="section"
      id="stats"
      py={100}
      style={{
        backgroundColor: 'var(--mantine-color-dark-9)',
        borderTop: '1px solid var(--mantine-color-surface-8)',
        borderBottom: '1px solid var(--mantine-color-surface-8)',
      }}
    >
      <Container size="lg">
        <Stack gap={60}>
          {/* Section header */}
          <Stack align="center" gap="md" ta="center">
            <Text size="sm" tt="uppercase" fw={600} c="primary.5" style={{ letterSpacing: '1px' }}>
              Live Data
            </Text>
            <Text size="lg" c="surface.4" maw={500}>
              Real-time statistics from our database, updated nightly from Falling Fruit.
            </Text>
          </Stack>

          {/* Stats grid */}
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl">
            {statConfigs.map((stat) => (
              <Paper
                key={stat.key}
                p="xl"
                radius="lg"
                style={{
                  backgroundColor: 'var(--mantine-color-surface-8)',
                  border: '1px solid var(--mantine-color-surface-7)',
                  textAlign: 'center',
                }}
              >
                <Stack align="center" gap="sm">
                  <stat.icon
                    size={32}
                    color={`var(--mantine-color-${stat.color}-5)`}
                  />
                  {isLoading ? (
                    <Skeleton height={48} width={120} radius="md" />
                  ) : error ? (
                    <Text size="xl" fw={700} c="surface.5">
                      —
                    </Text>
                  ) : (
                    <Text
                      size="3rem"
                      fw={700}
                      c="white"
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {formatNumber(stats?.[stat.key] ?? 0)}
                    </Text>
                  )}
                  <Text c="surface.4" size="sm">
                    {stat.label}
                  </Text>
                </Stack>
              </Paper>
            ))}
          </SimpleGrid>
        </Stack>
      </Container>
    </Box>
  );
}
