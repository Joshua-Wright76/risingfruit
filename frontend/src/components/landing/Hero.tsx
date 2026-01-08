import { Link } from 'react-router';
import { Container, Title, Text, Button, Stack, Box } from '@mantine/core';
import { ArrowRight, MapPin } from 'lucide-react';

export function Hero() {
  return (
    <Box
      component="section"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(180deg, rgba(22, 163, 74, 0.1) 0%, transparent 50%)',
        paddingTop: '80px',
      }}
    >
      <Container size="md">
        <Stack align="center" gap="xl" ta="center">
          {/* Badge */}
          <Box
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '20px',
              backgroundColor: 'rgba(22, 163, 74, 0.15)',
              border: '1px solid rgba(22, 163, 74, 0.3)',
            }}
          >
            <MapPin size={16} color="var(--mantine-color-primary-5)" />
            <Text size="sm" c="primary.5" fw={500}>
              1.9M+ foraging locations worldwide
            </Text>
          </Box>

          {/* Headline */}
          <Title
            order={1}
            size="3.5rem"
            fw={700}
            c="white"
            style={{ lineHeight: 1.1 }}
          >
            Discover Nature's{' '}
            <Text
              component="span"
              inherit
              variant="gradient"
              gradient={{ from: 'primary.4', to: 'primary.6' }}
            >
              Urban Bounty
            </Text>
          </Title>

          {/* Subheadline */}
          <Text size="xl" c="surface.4" maw={600} lh={1.6}>
            Find free fruit, nuts, and edible plants in your neighborhood.
            Join the world's largest urban foraging community.
          </Text>

          {/* CTA Buttons */}
          <Stack gap="md" mt="lg">
            <Button
              component={Link}
              to="/app"
              size="xl"
              color="primary"
              rightSection={<ArrowRight size={20} />}
              styles={{
                root: {
                  paddingLeft: '32px',
                  paddingRight: '28px',
                },
              }}
            >
              Launch App
            </Button>
            <Text size="sm" c="surface.5">
              Free to use. No account required.
            </Text>
          </Stack>

          {/* Scroll indicator */}
          <Box
            mt={60}
            style={{
              animation: 'bounce 2s infinite',
            }}
          >
            <Text size="sm" c="surface.6">
              Scroll to learn more
            </Text>
          </Box>
        </Stack>
      </Container>

      <style>
        {`
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
          }
        `}
      </style>
    </Box>
  );
}
