import { Button } from '@/components/ui/button';
import { useNavigate } from '@/router';
import React from 'react';

function Nav() {
  const navigate = useNavigate();

  return (
    <div className="relative w-full py-4">
      <h1 className="text-center text-xl font-bold">
        Access your Citizen Portal
      </h1>
      <Button
        onClick={() => navigate('/power-bi')}
        className="absolute top-3 right-6"
      >
        Home
      </Button>
    </div>
  );
}

export default Nav;
