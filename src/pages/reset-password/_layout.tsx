import { useAuth } from '@/features/auth';
import { useEffect } from 'react';
import { useNavigate } from '@/router';
import { Outlet } from 'react-router';

export default function ResetLayout() {
  //   const { user } = useAuth();
  //   const navigate = useNavigate();

  //   useEffect(() => {
  //     if (user) {
  //       navigate('/');
  //     }
  //   }, [user, navigate]);

  //   if (user) return null;

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center bg-cover bg-top p-12 px-4"
      style={{
        backgroundImage: `url('/assets/background.png')`,
      }}
    >
      <div className="mb-2 flex items-center gap-2 max-sm:flex-col">
        <img
          src="/assets/logo.png"
          alt="Smart City Hub"
          className="h-14 w-14"
        />
        <h3 className="text-2xl font-bold text-[#1E3A8A] max-sm:text-center sm:text-2xl">
          SMART CITY HUB
        </h3>
      </div>
      <Outlet />
    </div>
  );
}
