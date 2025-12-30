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
      <div className="h-screen w-screen">
        <ForagingMap />
      </div>
    </QueryClientProvider>
  );
}

export default App;
