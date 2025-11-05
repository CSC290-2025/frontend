import { Button } from '@/components/ui/button';
import { useNavigate } from '@/router';
import React from 'react';

function Categories({ title, type }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center text-center">
      <h1 className="mb-4 font-medium">{title}</h1>
      <div className="flex w-50 flex-col gap-2">
        <Button onClick={() => navigate(`/power-bi/${type}/healthcare`)}>
          Healthcare
        </Button>
        <Button onClick={() => navigate(`/power-bi/${type}/weather`)}>
          Weather
        </Button>
        <Button onClick={() => navigate(`/power-bi/${type}/demographic`)}>
          Demographic
        </Button>
        <Button onClick={() => navigate(`/power-bi/${type}/traffic`)}>
          Traffic
        </Button>
      </div>
    </div>
  );
}

export default Categories;
