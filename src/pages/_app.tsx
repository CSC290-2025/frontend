import { Outlet } from 'react-router';
import { Redirects } from '@/config/redirects';

export default function App() {
  return (
    <Redirects>
      <Outlet />
    </Redirects>
  );
}
