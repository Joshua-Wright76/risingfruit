import { Link } from 'react-router';
import {
  Container,
  Group,
  Button,
  Burger,
  Drawer,
  Stack,
  Text,
  Anchor,
  Box,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Leaf } from 'lucide-react';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Stats', href: '#stats' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

export function Navbar() {
  const [opened, { toggle, close }] = useDisclosure(false);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    close();
  };

  return (
    <Box
      component="header"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--mantine-color-surface-7)',
      }}
    >
      <Container size="lg" py="md">
        <Group justify="space-between">
          {/* Logo */}
          <Group gap="xs">
            <Leaf size={28} color="var(--mantine-color-primary-5)" />
            <Text fw={700} size="xl" c="white">
              Rising Fruit
            </Text>
          </Group>

          {/* Desktop Navigation */}
          <Group gap="xl" visibleFrom="sm">
            {navLinks.map((link) => (
              <Anchor
                key={link.href}
                href={link.href}
                onClick={(e) => handleSmoothScroll(e, link.href)}
                c="surface.3"
                style={{ textDecoration: 'none' }}
              >
                {link.label}
              </Anchor>
            ))}
            <Button
              component={Link}
              to="/app"
              color="primary"
              size="sm"
            >
              Launch App
            </Button>
          </Group>

          {/* Mobile Burger */}
          <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom="sm"
            color="white"
          />
        </Group>
      </Container>

      {/* Mobile Drawer */}
      <Drawer
        opened={opened}
        onClose={close}
        position="right"
        size="xs"
        title={
          <Group gap="xs">
            <Leaf size={24} color="var(--mantine-color-primary-5)" />
            <Text fw={700}>Rising Fruit</Text>
          </Group>
        }
        styles={{
          body: { backgroundColor: 'var(--mantine-color-dark-9)' },
          header: { backgroundColor: 'var(--mantine-color-dark-9)' },
        }}
      >
        <Stack gap="lg" mt="xl">
          {navLinks.map((link) => (
            <Anchor
              key={link.href}
              href={link.href}
              onClick={(e) => handleSmoothScroll(e, link.href)}
              c="surface.3"
              size="lg"
              style={{ textDecoration: 'none' }}
            >
              {link.label}
            </Anchor>
          ))}
          <Button
            component={Link}
            to="/app"
            color="primary"
            size="md"
            fullWidth
            mt="md"
          >
            Launch App
          </Button>
        </Stack>
      </Drawer>
    </Box>
  );
}
