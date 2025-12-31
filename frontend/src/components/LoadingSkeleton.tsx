import { Box, Skeleton, Center, Stack, Text, Loader } from '@mantine/core';
import { Leaf } from 'lucide-react';

export function LoadingSkeleton() {
  return (
    <Box
      pos="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      style={{
        zIndex: 20,
        backgroundColor: 'var(--mantine-color-surface-9)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header skeleton */}
      <Box p={16}>
        <Stack gap={12}>
          {/* Search bar skeleton */}
          <Skeleton height={48} radius="lg" style={{ opacity: 0.5 }} />
          {/* Filter bar skeleton */}
          <Skeleton height={48} width={128} radius="lg" style={{ opacity: 0.5 }} />
        </Stack>
      </Box>

      {/* Map area with loading indicator */}
      <Center style={{ flex: 1 }}>
        <Stack align="center" gap={0}>
          <Box pos="relative" w={80} h={80}>
            <Loader
              size={80}
              color="primary.5"
              style={{ opacity: 0.2, position: 'absolute', top: 0, left: 0 }}
            />
            <Center pos="absolute" top={0} left={0} w={80} h={80}>
              <Box
                style={{
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                }}
              >
                <Leaf size={40} style={{ color: 'var(--mantine-color-primary-5)' }} />
              </Box>
            </Center>
          </Box>
          <Text
            mt={32}
            size="sm"
            fw={600}
            c="gray.5"
            style={{ letterSpacing: '0.05em' }}
          >
            INITIALIZING MAP...
          </Text>
        </Stack>
      </Center>

      {/* Bottom controls skeleton */}
      <Box pos="absolute" bottom={24} right={16}>
        <Stack gap={8}>
          <Skeleton width={44} height={44} radius="lg" style={{ opacity: 0.3 }} />
          <Skeleton width={44} height={88} radius="lg" style={{ opacity: 0.3 }} />
        </Stack>
      </Box>

      {/* CSS for pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </Box>
  );
}
