import { Container, Group, Text, Anchor, Stack, Box, Divider } from '@mantine/core';
import { Leaf } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      py="xl"
      style={{
        backgroundColor: 'var(--mantine-color-dark-9)',
        borderTop: '1px solid var(--mantine-color-surface-8)',
      }}
    >
      <Container size="lg">
        <Stack gap="lg">
          <Group justify="space-between" wrap="wrap" gap="md">
            {/* Logo */}
            <Group gap="xs">
              <Leaf size={20} color="var(--mantine-color-primary-5)" />
              <Text fw={600} c="white">
                Rising Fruit
              </Text>
            </Group>

            {/* Links */}
            <Group gap="xl">
              <Anchor href="https://fallingfruit.org" target="_blank" c="surface.4" size="sm">
                Falling Fruit
              </Anchor>
              <Anchor href="https://github.com" target="_blank" c="surface.4" size="sm">
                GitHub
              </Anchor>
              <Anchor href="#contact" c="surface.4" size="sm">
                Contact
              </Anchor>
            </Group>
          </Group>

          <Divider color="surface.8" />

          <Group justify="space-between" wrap="wrap" gap="md">
            <Text size="xs" c="surface.5">
              {currentYear} Rising Fruit. Data powered by{' '}
              <Anchor href="https://fallingfruit.org" target="_blank" c="surface.4" size="xs">
                Falling Fruit
              </Anchor>
              .
            </Text>
            <Text size="xs" c="surface.6">
              Made with care for urban foragers everywhere.
            </Text>
          </Group>
        </Stack>
      </Container>
    </Box>
  );
}
