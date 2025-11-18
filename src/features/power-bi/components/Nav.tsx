import { Button } from '@/components/ui/button';
import { useNavigate } from '@/router';
import React from 'react';
import { useUserRole } from '../hooks/useUserRole';

function Nav() {
  // const user = {
  //   name: 'Alora',
  //   role: 'admin',
  // };
  const { role } = useUserRole();
  const navigate = useNavigate();

  return (
    <div className="box-border flex w-full flex-col items-center gap-3 px-4 py-3 sm:flex-row sm:justify-between">
      <div className="hidden w-1/3 sm:block"></div>

      <h1 className="text-center text-lg font-bold sm:w-1/3 sm:text-xl md:text-xl lg:text-2xl">
        Access your {role} Portal
      </h1>

      <div className="flex justify-center gap-2 sm:w-1/3 sm:justify-end">
        <Button
          onClick={() => navigate('/power-bi')}
          variant="outline"
          className="border-[#01CCFF] bg-white text-[#01CCFF] hover:text-[#01CCFF]"
        >
          Home
        </Button>

        {role === 'admin' && (
          <Button
            onClick={() => navigate('/power-bi/create')}
            className="bg-[#01CCFF] hover:bg-[#0091B5]"
          >
            + New Report
          </Button>
        )}
      </div>
    </div>
  );
}

export default Nav;
