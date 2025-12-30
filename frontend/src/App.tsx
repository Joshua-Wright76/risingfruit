import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ForagingMap } from './components/Map';

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
    <QueryClientProvider client={queryClient}>
      <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
        <ForagingMap />
      </div>
    </QueryClientProvider>
  );
}

export default App;
