import { useNavigate, useParams } from '@/router';
import React from 'react';
import Nav from '../components/Nav';
import { Button } from '@/components/ui/button';

function IndividualSummaryPage() {
  const user = {
    name: 'Alora',
    role: 'admin', // change later
  };

  const { category, reportId } = useParams(
    '/power-bi/summary/:category/:reportId'
  );
  const navigate = useNavigate();

  const reportLinks = {
    healthcare: [
      {
        id: 'healthcare1',
        name: 'Healthcare Report One',
        description: 'this is the description',
        link: 'https://app.powerbi.com/view?r=eyJrIjoiYmE2NzE0NTMtMWIxZi00ZmIyLTgyOGItNjlkNjc2NWI0MzJiIiwidCI6IjZmNDQzMmRjLTIwZDItNDQxZC1iMWRiLWFjMzM4MGJhNjMzZCIsImMiOjEwfQ%3D%3D',
      },
      {
        id: 'healthcare2',
        name: 'testing healthcare 2',
        description: 'djkffjg',
        link: 'https://app.powerbi.com/reportEmbed?reportId=e2f13170-33ba-416c-a6aa-44344e11dab2&autoAuth=true&ctid=6f4432dc-20d2-441d-b1db-ac3380ba633d',
      },
    ],
    weather: [
      {
        id: 'testing1',
        name: 'testing 1',
        description: 'djkffjg',
        link: 'https://app.powerbi.com/reportEmbed?reportId=e2f13170-33ba-416c-a6aa-44344e11dab2&autoAuth=true&ctid=6f4432dc-20d2-441d-b1db-ac3380ba633d',
      },
    ],
    demographic:
      'https://app.powerbi.com/reportEmbed?reportId=e2f13170-33ba-416c-a6aa-44344e11dab2&autoAuth=true&ctid=6f4432dc-20d2-441d-b1db-ac3380ba633d',
    traffic:
      'https://app.powerbi.com/reportEmbed?reportId=e2f13170-33ba-416c-a6aa-44344e11dab2&autoAuth=true&ctid=6f4432dc-20d2-441d-b1db-ac3380ba633d',
  };

  const reports = reportLinks[category];
  const report = reports.find((r) => r.id == reportId);

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-around p-10">
      <Nav />
      <h2 className="font-medium">Summary City Performance Dashboard</h2>
      <h2>{category}</h2>
      <h2>{report.name}</h2>
      <iframe
        title={report.name}
        src={report.link}
        className="mb-4 h-[800px] w-full border-0 outline-none"
        frameBorder="0"
      ></iframe>
      <p>{report.description}</p>
      {user.role === 'admin' && (
        <Button
          className="mt-4"
          onClick={() => navigate(`/power-bi/edit/${report.id}`)}
        >
          Edit Report
        </Button>
      )}
    </div>
  );
}

export default IndividualSummaryPage;
