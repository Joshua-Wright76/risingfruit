import { Container, SimpleGrid, Stack, Text, Box, Paper, Title } from '@mantine/core';
import { Map, ListFilter, Info } from 'lucide-react';

const screenshots = [
  {
    title: 'Interactive Map',
    description: 'Explore thousands of foraging spots with clustered markers and smooth navigation.',
    icon: Map,
    placeholder: true,
  },
  {
    title: 'Smart Filters',
    description: 'Filter by plant type, category, or season to find exactly what you\'re looking for.',
    icon: ListFilter,
    placeholder: true,
  },
  {
    title: 'Location Details',
    description: 'Get detailed info including access notes, seasons, and directions.',
    icon: Info,
    placeholder: true,
  },
];

export function Screenshots() {
  return (
    <Box
      component="section"
      id="screenshots"
      py={100}
      style={{
        backgroundColor: 'var(--mantine-color-surface-9)',
      }}
    >
      <Container size="lg">
        <Stack gap={60}>
          {/* Section header */}
          <Stack align="center" gap="md" ta="center">
            <Text size="sm" tt="uppercase" fw={600} c="primary.5" style={{ letterSpacing: '1px' }}>
              Screenshots
            </Text>
            <Title order={2} size="2.5rem" fw={700} c="white">
              See it in action
            </Title>
            <Text size="lg" c="surface.4" maw={600}>
              A beautiful, mobile-first interface designed for foraging on the go.
            </Text>
          </Stack>

          {/* Screenshot placeholders */}
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl">
            {screenshots.map((item) => (
              <Stack key={item.title} gap="md" align="center">
                <Paper
                  radius="lg"
                  style={{
                    width: '100%',
                    aspectRatio: '9/16',
                    maxWidth: '280px',
                    backgroundColor: 'var(--mantine-color-surface-8)',
                    border: '1px solid var(--mantine-color-surface-7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '16px',
                  }}
                >
                  <item.icon size={48} color="var(--mantine-color-surface-6)" />
                  <Text size="sm" c="surface.5" ta="center" px="lg">
                    Screenshot coming soon
                  </Text>
                </Paper>
                <Stack gap={4} ta="center">
                  <Text fw={600} c="white">
                    {item.title}
                  </Text>
                  <Text size="sm" c="surface.4" maw={280}>
                    {item.description}
                  </Text>
                </Stack>
              </Stack>
            ))}
          </SimpleGrid>
        </Stack>
      </Container>
    </Box>
  );
}
