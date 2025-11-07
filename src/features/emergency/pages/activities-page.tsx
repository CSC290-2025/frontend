import { Clock } from 'lucide-react';
import { useSearchParams } from 'react-router';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/features/emergency/components/ui/tabs';
import { Card, CardContent } from '@/features/emergency/components/ui/card';
import { Badge } from '@/features/emergency/components/ui/badge.tsx';
import { PaginationWithLinks } from '@/features/emergency/components/ui/pagination-with-link.tsx';
import { useReportFrom } from '@/features/emergency/hooks/report-from.tsx';
import { useNavigate } from 'react-router';
import { useEffect } from 'react';

export default function ActivitiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const currentPage = parseInt(searchParams.get('_page') || '1', 10);
  const perPage = parseInt(searchParams.get('_limit') || '5', 10);

  const { report, isLoading, totalPage } = useReportFrom();

  useEffect(() => {
    return () => {
      report.map((r) => console.log(r));
    };
  }, [report]);

  return (
    <div className="p-2 sm:p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-2">
        <Clock size={32} />
        <h1 className="text-3xl font-bold">Activities</h1>
      </div>

      <Tabs defaultValue="Ongoing" className="w-full">
        <TabsList>
          <TabsTrigger value="Ongoing">Ongoing</TabsTrigger>
          <TabsTrigger value="Complete">Complete</TabsTrigger>
        </TabsList>

        {/* Ongoing Tab */}
        <TabsContent value="Ongoing" className="mb-6">
          <div className="h-auto">
            {isLoading && <div>Loading...</div>}
            {report.map((r) => (
              <div key={r.id} className="mb-6">
                <Card className="w-full">
                  <CardContent>
                    <div className="grid grid-cols-6">
                      <Card
                        className="col-span-2 overflow-hidden py-0 sm:col-span-1"
                        onClick={() => {
                          navigate(`${r.image_url}`);
                        }}
                      >
                        {r.image_url ? (
                          <img
                            alt={r.title}
                            src={
                              r.image_url instanceof File
                                ? URL.createObjectURL(r.image_url)
                                : r.image_url
                            }
                            className="aspect-square object-cover"
                          />
                        ) : (
                          <h1>Not have picture</h1>
                        )}
                      </Card>
                      <div className="col-span-4 gap-2 pl-5">
                        <div className="">{r.description}</div>
                        <div className="object-bottom">
                          <Badge>{r.status}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      <PaginationWithLinks
        page={currentPage}
        pageSize={perPage}
        totalCount={totalPage}
        pageSizeSelectOptions={{
          pageSizeOptions: [5, 10, 25, 50],
        }}
      />
    </div>
  );
}
