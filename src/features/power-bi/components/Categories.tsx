import { Button } from '@/components/ui/button';
import React from 'react';

function Categories({ title }) {
  return (
    <div className="flex flex-col items-center text-center">
      <h1 className="mb-4 font-medium">{title}</h1>
      <div className="flex w-50 flex-col gap-2">
        <Button>Healthcare</Button>
        <Button>Weather</Button>
        <Button>Demographic</Button>
        <Button>Traffic</Button>
      </div>
    </div>
  );
}

export default Categories;
