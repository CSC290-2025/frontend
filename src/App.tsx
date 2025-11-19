import { Routes } from '@generouted/react-router';
import { useAuthenticated } from '@/hooks/useAuthenticated';
import { Spinner } from '@/components/ui/spinner';

function App() {
  const { isLoading } = useAuthenticated();

  if (isLoading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-12 w-12" />
          {/* <p className="text-gray-600">Loading...</p> */}
        </div>
      </div>
    );

  return <Routes />;
}

export default App;
