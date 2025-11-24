import { Outlet } from 'react-router';
import { Redirects } from '@/config/redirects';
import BackButton from '@/components/main/BackButton';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function App() {
  return (
    <Redirects>
      <ErrorBoundary>
        {/* not permanent, just for demonstration today */}
        <BackButton />
        <Outlet />
      </ErrorBoundary>
    </Redirects>
  );
}
