import { Container, Stack, Text, Box, Paper, Avatar, Group, Anchor, Title } from '@mantine/core';
import { Linkedin, Github } from 'lucide-react';

export function Founder() {
  return (
    <Box
      component="section"
      id="about"
      py={100}
      style={{
        backgroundColor: 'var(--mantine-color-dark-9)',
        borderTop: '1px solid var(--mantine-color-surface-8)',
      }}
    >
      <Container size="sm">
        <Stack gap={40} align="center">
          {/* Section header */}
          <Stack align="center" gap="md" ta="center">
            <Text size="sm" tt="uppercase" fw={600} c="primary.5" style={{ letterSpacing: '1px' }}>
              About
            </Text>
            <Title order={2} size="2rem" fw={700} c="white">
              Meet the Founder
            </Title>
          </Stack>

          {/* Founder card */}
          <Paper
            p="xl"
            radius="lg"
            style={{
              backgroundColor: 'var(--mantine-color-surface-8)',
              border: '1px solid var(--mantine-color-surface-7)',
              maxWidth: '480px',
              width: '100%',
            }}
          >
            <Stack align="center" gap="lg" ta="center">
              {/* Avatar placeholder */}
              <Avatar
                size={120}
                radius="xl"
                color="primary"
                style={{
                  border: '3px solid var(--mantine-color-primary-6)',
                }}
              >
                JW
              </Avatar>

              {/* Name and title */}
              <Stack gap={4}>
                <Text size="xl" fw={700} c="white">
                  Joshua Wright
                </Text>
                <Text c="surface.4">
                  Founder & Developer
                </Text>
              </Stack>

              {/* Bio */}
              <Text c="surface.3" size="sm" lh={1.7}>
                Passionate about urban foraging and making nature's abundance accessible to everyone.
                Rising Fruit brings the power of the Falling Fruit database to a modern, mobile-first experience.
              </Text>

              {/* Social links */}
              <Group gap="md" mt="sm">
                <Anchor
                  href="https://linkedin.com"
                  target="_blank"
                  c="surface.4"
                  style={{ transition: 'color 0.2s' }}
                >
                  <Linkedin size={24} />
                </Anchor>
                <Anchor
                  href="https://github.com"
                  target="_blank"
                  c="surface.4"
                  style={{ transition: 'color 0.2s' }}
                >
                  <Github size={24} />
                </Anchor>
              </Group>
            </Stack>
          </Paper>

          {/* Falling Fruit attribution */}
          <Text size="sm" c="surface.5" ta="center" maw={400}>
            Rising Fruit is built on data from{' '}
            <Anchor href="https://fallingfruit.org" target="_blank" c="primary.5">
              Falling Fruit
            </Anchor>
            , a nonprofit project mapping the world's edible plants.
          </Text>
        </Stack>
      </Container>
    </Box>
  );
}
