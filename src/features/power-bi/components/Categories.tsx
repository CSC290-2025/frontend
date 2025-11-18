import { Button } from '@/components/ui/button';
import { useNavigate } from '@/router';
import React from 'react';

function Categories({ type }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center text-center">
      <h1 className="mb-4 font-medium">Choose a category</h1>
      <div className="flex w-50 flex-col gap-2">
        <Button
          onClick={() =>
            navigate('/power-bi/:type/:category', {
              params: { type, category: 'healthcare' },
            })
          }
          className="cursor-pointer bg-[#01CCFF] hover:bg-[#0091B5]"
        >
          Healthcare
        </Button>
        <Button
          onClick={() =>
            navigate('/power-bi/:type/:category', {
              params: { type, category: 'weather' },
            })
          }
          className="cursor-pointer bg-[#01CCFF] hover:bg-[#0091B5]"
        >
          Weather
        </Button>
        <Button
          onClick={() =>
            navigate('/power-bi/:type/:category', {
              params: { type, category: 'demographic' },
            })
          }
          className="cursor-pointer bg-[#01CCFF] hover:bg-[#0091B5]"
        >
          Demographic
        </Button>
        <Button
          onClick={() =>
            navigate('/power-bi/:type/:category', {
              params: { type, category: 'traffic' },
            })
          }
          className="cursor-pointer bg-[#01CCFF] hover:bg-[#0091B5]"
        >
          Traffic
        </Button>
      </div>
    </div>
  );
}

export default Categories;
