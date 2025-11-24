import { Outlet } from 'react-router';
import { Redirects } from '@/config/redirects';
import BackButton from '@/components/main/BackButton';

export default function App() {
  return (
    <Redirects>
      {/* not permanent, just for demonstration today */}
      <BackButton />
      <Outlet />
    </Redirects>
  );
}
