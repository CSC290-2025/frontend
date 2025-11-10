import { Button } from '@/components/ui/button';
import { Link, useNavigate, useParams } from '@/router';
import React from 'react';

function SummaryPage() {
  const { category } = useParams('/power-bi/summary/:category');
  const navigate = useNavigate();

  const reportLinks = {
    healthcare: [
      {
        id: 'healthcare1',
        name: 'Healthcare Report One',
        link: 'https://app.powerbi.com/view?r=eyJrIjoiYmE2NzE0NTMtMWIxZi00ZmIyLTgyOGItNjlkNjc2NWI0MzJiIiwidCI6IjZmNDQzMmRjLTIwZDItNDQxZC1iMWRiLWFjMzM4MGJhNjMzZCIsImMiOjEwfQ%3D%3D',
      },
      {
        id: 'healthcare2',
        name: 'testing healthcare 2',
        link: 'https://app.powerbi.com/reportEmbed?reportId=e2f13170-33ba-416c-a6aa-44344e11dab2&autoAuth=true&ctid=6f4432dc-20d2-441d-b1db-ac3380ba633d',
      },
    ],
    weather: [
      {
        id: 'testing1',
        name: 'testing 1',
        link: 'https://app.powerbi.com/reportEmbed?reportId=e2f13170-33ba-416c-a6aa-44344e11dab2&autoAuth=true&ctid=6f4432dc-20d2-441d-b1db-ac3380ba633d',
      },
    ],
    demographic:
      'https://app.powerbi.com/reportEmbed?reportId=e2f13170-33ba-416c-a6aa-44344e11dab2&autoAuth=true&ctid=6f4432dc-20d2-441d-b1db-ac3380ba633d',
    traffic:
      'https://app.powerbi.com/reportEmbed?reportId=e2f13170-33ba-416c-a6aa-44344e11dab2&autoAuth=true&ctid=6f4432dc-20d2-441d-b1db-ac3380ba633d',
  };

  const categoryReports = reportLinks[category];

  return (
    <div className="flex h-screen w-screen flex-col justify-around p-5">
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
      <div className="flex items-center gap-2">
        <h2 className="font-medium">Summary City Performance Dashboard </h2>
        <div>
          <select
            value={category}
            onChange={(e) => navigate(`/power-bi/summary/${e.target.value}`)}
            className="border-0 bg-gray-100 px-1 py-2"
          >
            <option>healthcare</option>
            <option>weather</option>
            <option>demographic</option>
            <option>traffic</option>
          </select>
        </div>
      </div>
      {categoryReports.map((g) => (
        <div key={g.id}>
          <Link to={`/power-bi/summary/${category}/${g.id}`}>
            <h2>{g.name}</h2>
            <iframe
              title={g.name}
              src={g.link}
              className="h-[400px] w-full border-0 outline-none"
              frameBorder="0"
            ></iframe>
          </Link>
        </div>
      ))}
    </div>
  );
}

export default SummaryPage;
