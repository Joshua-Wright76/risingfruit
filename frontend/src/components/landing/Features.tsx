import { Container, SimpleGrid, Card, ThemeIcon, Title, Text, Stack, Box } from '@mantine/core';
import { MapPin, Calendar, Smartphone, Search } from 'lucide-react';

const features = [
  {
    icon: MapPin,
    title: '1.9M+ Locations',
    description: 'Access the world\'s largest urban foraging database, powered by the Falling Fruit community.',
    color: 'primary',
  },
  {
    icon: Calendar,
    title: 'What\'s In Season',
    description: 'Filter by what\'s ripe and ready to harvest right now in your area.',
    color: 'accent',
  },
  {
    icon: Smartphone,
    title: 'Works Offline',
    description: 'Install as an app on your phone. Works anywhere, even without internet.',
    color: 'primary',
  },
  {
    icon: Search,
    title: 'Real-Time Map',
    description: 'Fast clustering, instant search, and tap-to-explore interface.',
    color: 'accent',
  },
];

export function Features() {
  return (
    <Box
      component="section"
      id="features"
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
              Features
            </Text>
            <Title order={2} size="2.5rem" fw={700} c="white">
              Everything you need to forage
            </Title>
            <Text size="lg" c="surface.4" maw={600}>
              Rising Fruit makes urban foraging accessible, combining powerful
              search with a beautiful mobile-first interface.
            </Text>
          </Stack>

          {/* Feature cards */}
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
            {features.map((feature) => (
              <Card
                key={feature.title}
                padding="xl"
                radius="lg"
                style={{
                  backgroundColor: 'var(--mantine-color-surface-8)',
                  border: '1px solid var(--mantine-color-surface-7)',
                }}
              >
                <Stack gap="md">
                  <ThemeIcon
                    size={56}
                    radius="lg"
                    color={feature.color}
                    variant="light"
                  >
                    <feature.icon size={28} />
                  </ThemeIcon>
                  <Title order={3} size="h4" c="white">
                    {feature.title}
                  </Title>
                  <Text c="surface.4" lh={1.6}>
                    {feature.description}
                  </Text>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        </Stack>
      </Container>
    </Box>
  );
}
