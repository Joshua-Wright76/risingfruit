import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { Box, Paper, Text, Loader, Center, Button, Group, Stack, SimpleGrid, Badge, UnstyledButton } from '@mantine/core';
import { X, Navigation, Calendar, Lock, Leaf, ExternalLink } from 'lucide-react';
import { getLocation } from '../lib/api';
import { getFallbackSeason, formatFallbackSeason, isLocationInSeason } from '../lib/fruitSeasons';
import type { LocationDetail } from '../types/location';

interface LocationSheetProps {
  locationId: number | null;
  onClose: () => void;
}

interface SeasonInfo {
  text: string;
  isFallback: boolean;
}

function formatSeason(start: string | null, stop: string | null, noSeason: boolean, typeIds: number[]): SeasonInfo {
  if (noSeason) return { text: 'Year-round', isFallback: false };
  
  if (start || stop) {
    if (start && stop) return { text: `${start} – ${stop}`, isFallback: false };
    if (start) return { text: `From ${start}`, isFallback: false };
    return { text: `Until ${stop}`, isFallback: false };
  }
  
  // Try to get fallback season based on plant type
  const fallbackSeason = getFallbackSeason(typeIds);
  if (fallbackSeason) {
    return { text: formatFallbackSeason(fallbackSeason), isFallback: true };
  }
  
  return { text: 'Unknown', isFallback: false };
}

function getDirectionsUrl(lat: number, lng: number): string {
  // Use Apple Maps on iOS, Google Maps elsewhere
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOS) {
    return `maps://maps.apple.com/?daddr=${lat},${lng}`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export function LocationSheet({ locationId, onClose }: LocationSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  
  const { data: location, isLoading, error } = useQuery({
    queryKey: ['location', locationId],
    queryFn: () => (locationId ? getLocation(locationId) : null),
    enabled: !!locationId,
  });

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (locationId) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [locationId, onClose]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (locationId) {
      // Delay to prevent immediate close from marker click
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [locationId, onClose]);

  const isOpen = locationId !== null;

  // Use React Portal to render outside the Map container hierarchy
  return createPortal(
    <>
      {/* Backdrop - only render when open */}
      {isOpen && (
        <Box
          pos="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            transition: 'opacity 300ms',
            opacity: 1,
            pointerEvents: 'none',
            zIndex: 9998,
          }}
        />
      )}

      {/* Sheet */}
      <Paper
        ref={sheetRef}
        data-testid="location-sheet"
        data-open={isOpen}
        shadow="xl"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          maxHeight: '70vh',
          minHeight: 200,
          zIndex: 9999,
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 300ms ease-out, visibility 0s linear ' + (isOpen ? '0s' : '300ms'),
          backgroundColor: 'var(--mantine-color-surface-9)',
          borderTop: '1px solid var(--mantine-color-surface-7)',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          pointerEvents: isOpen ? 'auto' : 'none',
          visibility: isOpen ? 'visible' : 'hidden',
        }}
      >
        {/* Handle */}
        <Center pt={12} pb={8}>
          <Box
            w={40}
            h={4}
            style={{
              backgroundColor: 'var(--mantine-color-surface-6)',
              borderRadius: 9999,
            }}
          />
        </Center>

        {/* Close button */}
        <UnstyledButton
          onClick={onClose}
          data-testid="location-sheet-close-button"
          pos="absolute"
          top={16}
          right={16}
          p={8}
          style={{ borderRadius: 9999 }}
          aria-label="Close"
        >
          <X size={20} style={{ color: 'var(--mantine-color-gray-4)' }} />
        </UnstyledButton>

        {/* Content */}
        <Box p="8px 24px 32px 24px" style={{ overflowY: 'auto', maxHeight: 'calc(70vh - 60px)' }}>
          {isLoading && (
            <Center py={48}>
              <Loader color="primary.5" size="lg" />
            </Center>
          )}

          {error && (
            <Center py={48}>
              <Text c="red.4">Failed to load location details</Text>
            </Center>
          )}

          {location && <LocationContent location={location} />}
        </Box>
      </Paper>
    </>,
    document.body
  );
}

function LocationContent({ location }: { location: LocationDetail }) {
  const primaryType = location.types[0];
  const isInSeason = isLocationInSeason(location);
  
  return (
    <Stack gap={20}>
      {/* Header */}
      <Group align="flex-start" gap={12} wrap="nowrap">
        <Box
          style={{
            flexShrink: 0,
            width: 48,
            height: 48,
            backgroundColor: 'rgba(20, 83, 45, 0.5)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Leaf size={24} style={{ color: 'var(--mantine-color-primary-4)' }} />
        </Box>
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Group gap={8} align="center">
            <Text
              size="lg"
              fw={600}
              c="gray.0"
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {primaryType?.en_name || 'Unknown Type'}
            </Text>
            {isInSeason && (
              <Badge 
                variant="filled" 
                color="green.8" 
                size="sm" 
                radius="sm"
                styles={{ root: { textTransform: 'none' } }}
              >
                In Season
              </Badge>
            )}
          </Group>
          {primaryType?.scientific_name && (
            <Text
              size="sm"
              c="gray.5"
              fs="italic"
              mt={4}
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {primaryType.scientific_name}
            </Text>
          )}
        </Box>
      </Group>

      {/* Description */}
      {location.description && (
        <Text c="gray.3" lh={1.6}>
          {location.description}
        </Text>
      )}

      {/* Info grid */}
      <SimpleGrid cols={2} spacing={12}>
        {/* Season */}
        {(() => {
          const seasonInfo = formatSeason(location.season_start, location.season_stop, location.no_season, location.type_ids);
          return (
            <Box
              p={16}
              style={{
                backgroundColor: 'var(--mantine-color-surface-8)',
                borderRadius: 12,
              }}
            >
              <Group gap={8} mb={4}>
                <Calendar size={16} style={{ color: 'var(--mantine-color-primary-4)' }} />
                <Text size="xs" fw={500} c="gray.5" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
                  Season
                </Text>
              </Group>
              <Text size="sm" fw={500} c="gray.2">
                {seasonInfo.text}
              </Text>
              {seasonInfo.isFallback && (
                <Text size="xs" c="gray.5" fs="italic" mt={4}>
                  (typical for this plant)
                </Text>
              )}
            </Box>
          );
        })()}

        {/* Access */}
        <Box
          p={16}
          style={{
            backgroundColor: 'var(--mantine-color-surface-8)',
            borderRadius: 12,
          }}
        >
          <Group gap={8} mb={4}>
            <Lock
              size={16}
              style={{
                color: location.access?.toLowerCase().includes('private')
                  ? 'var(--mantine-color-accent-4)'
                  : 'var(--mantine-color-gray-5)',
              }}
            />
            <Text size="xs" fw={500} c="gray.5" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
              Access
            </Text>
          </Group>
          <Text size="sm" fw={500} c="gray.2">
            {location.access || 'Unknown'}
          </Text>
        </Box>
      </SimpleGrid>

      {/* Additional types */}
      {location.types.length > 1 && (
        <Box>
          <Text size="xs" fw={500} c="gray.5" tt="uppercase" style={{ letterSpacing: '0.05em' }} mb={8}>
            Also contains
          </Text>
          <Group gap={8}>
            {location.types.slice(1).map((type) => (
              <Badge
                key={type.id}
                variant="outline"
                color="primary"
                radius="xl"
                size="md"
                styles={{
                  root: {
                    backgroundColor: 'rgba(20, 83, 45, 0.5)',
                    borderColor: 'var(--mantine-color-primary-8)',
                    color: 'var(--mantine-color-primary-4)',
                  },
                }}
              >
                {type.en_name}
              </Badge>
            ))}
          </Group>
        </Box>
      )}

      {/* Verification status */}
      {location.unverified && (
        <Box
          p={12}
          style={{
            backgroundColor: 'rgba(124, 45, 18, 0.3)',
            border: '1px solid var(--mantine-color-accent-7)',
            borderRadius: 12,
          }}
        >
          <Text size="sm" c="accent.3">
            ⚠️ This location has not been verified
          </Text>
        </Box>
      )}

      {/* Actions */}
      <Box pt={8}>
        <Button
          component="a"
          href={getDirectionsUrl(location.lat, location.lng)}
          target="_blank"
          rel="noopener noreferrer"
          fullWidth
          size="lg"
          radius="lg"
          color="primary.6"
          leftSection={<Navigation size={20} />}
          rightSection={<ExternalLink size={16} style={{ opacity: 0.7 }} />}
        >
          Get Directions
        </Button>
      </Box>

      {/* Meta info */}
      {location.author && (
        <Text size="xs" c="gray.6" ta="center">
          Added by {location.author}
        </Text>
      )}
    </Stack>
  );
}
