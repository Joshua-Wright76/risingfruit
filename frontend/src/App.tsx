import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import { ForagingMap } from './components/Map';
import { theme } from './theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <QueryClientProvider client={queryClient}>
        <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
          <ForagingMap />
        </div>
      </QueryClientProvider>
    </MantineProvider>
  );
}

export default App;
