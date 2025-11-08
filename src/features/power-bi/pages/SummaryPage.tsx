import { useNavigate, useParams } from '@/router';
import React from 'react';

function SummaryPage() {
  const { category } = useParams();
  const navigate = useNavigate();

  const reportLinks = {
    healthcare:
      'https://app.powerbi.com/view?r=eyJrIjoiYmE2NzE0NTMtMWIxZi00ZmIyLTgyOGItNjlkNjc2NWI0MzJiIiwidCI6IjZmNDQzMmRjLTIwZDItNDQxZC1iMWRiLWFjMzM4MGJhNjMzZCIsImMiOjEwfQ%3D%3D',
    weather:
      'https://app.powerbi.com/reportEmbed?reportId=e2f13170-33ba-416c-a6aa-44344e11dab2&autoAuth=true&ctid=6f4432dc-20d2-441d-b1db-ac3380ba633d',
    demographic:
      'https://app.powerbi.com/reportEmbed?reportId=e2f13170-33ba-416c-a6aa-44344e11dab2&autoAuth=true&ctid=6f4432dc-20d2-441d-b1db-ac3380ba633d',
    traffic:
      'https://app.powerbi.com/reportEmbed?reportId=e2f13170-33ba-416c-a6aa-44344e11dab2&autoAuth=true&ctid=6f4432dc-20d2-441d-b1db-ac3380ba633d',
  };

  const currentLink = reportLinks[category];

  return (
    <div className="flex h-screen w-screen flex-col justify-around">
      <h1 className="my-5 text-center text-xl font-bold">
        Access your Citizen Portal
      </h1>{' '}
      <h2 className="mb-4 font-medium">
        Summary City Performance Dashboard - {category}
      </h2>
      <div>
        <select
          value={category}
          onChange={(e) => navigate(`/power-bi/summary/${e.target.value}`)}
        >
          <option>healthcare</option>
          <option>traffic</option>
        </select>
      </div>
      <iframe
        title={category}
        src={currentLink}
        frameBorder="0"
        allowFullScreen="true"
        className="h-3/4 w-full"
      ></iframe>
    </div>
  );
}

export default SummaryPage;
