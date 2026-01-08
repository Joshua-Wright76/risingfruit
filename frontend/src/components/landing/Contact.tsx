import { Container, Stack, Text, Box, Button, Paper, Title } from '@mantine/core';
import { Mail } from 'lucide-react';

export function Contact() {
  return (
    <Box
      component="section"
      id="contact"
      py={100}
      style={{
        backgroundColor: 'var(--mantine-color-surface-9)',
        borderTop: '1px solid var(--mantine-color-surface-8)',
      }}
    >
      <Container size="sm">
        <Paper
          p={{ base: 'xl', sm: 48 }}
          radius="lg"
          style={{
            backgroundColor: 'var(--mantine-color-surface-8)',
            border: '1px solid var(--mantine-color-surface-7)',
            textAlign: 'center',
          }}
        >
          <Stack align="center" gap="lg">
            <Box
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(22, 163, 74, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Mail size={28} color="var(--mantine-color-primary-5)" />
            </Box>

            <Stack gap="xs">
              <Title order={2} size="1.75rem" fw={700} c="white">
                Get in Touch
              </Title>
              <Text c="surface.4" maw={400}>
                Interested in Rising Fruit? Have questions about investment opportunities
                or partnerships? I'd love to hear from you.
              </Text>
            </Stack>

            <Button
              component="a"
              href="mailto:hello@risingfruit.app"
              size="lg"
              color="primary"
              leftSection={<Mail size={18} />}
              mt="md"
            >
              Send an Email
            </Button>

            <Text size="sm" c="surface.5">
              hello@risingfruit.app
            </Text>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
