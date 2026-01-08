import { Navbar } from '../components/landing/Navbar';
import { Hero } from '../components/landing/Hero';
import { Features } from '../components/landing/Features';
import { LiveStats } from '../components/landing/LiveStats';
import { Screenshots } from '../components/landing/Screenshots';
import { Founder } from '../components/landing/Founder';
import { Contact } from '../components/landing/Contact';
import { Footer } from '../components/landing/Footer';

export function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--mantine-color-dark-9)' }}>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <LiveStats />
        <Screenshots />
        <Founder />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
