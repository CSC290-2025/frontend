import { Outlet } from 'react-router';
import { Redirects } from '@/config/redirects';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function App() {
  return (
    <Redirects>
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </Redirects>
  );
}
