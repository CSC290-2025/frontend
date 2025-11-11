import { Button } from '@/components/ui/button';
import { useNavigate } from '@/router';
import React from 'react';

function Nav() {
  const user = {
    name: 'Alora',
    role: 'admin', // change later
  };

  const navigate = useNavigate();

  return (
    <div className="box-border flex w-full items-center justify-between px-4 py-2">
      <div className="w-1/3"></div>
      <h1 className="w-1/3 text-center text-xl font-bold">
        Access your Citizen Portal
      </h1>
      <div className="flex w-1/3 justify-end gap-2">
        <Button onClick={() => navigate('/power-bi')}>Home</Button>
        {user.role === 'admin' && (
          <Button onClick={() => navigate('/power-bi/create')}>
            + New Report
          </Button>
        )}
      </div>
    </div>
  );
}

export default Nav;
