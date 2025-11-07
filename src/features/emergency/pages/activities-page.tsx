import { Clock } from 'lucide-react';
import { useSearchParams } from 'react-router';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/features/emergency/components/ui/tabs';
import {
  Card,
  CardContent,
  CardFooter,
  CardTitle,
} from '@/features/emergency/components/ui/card';
import { PaginationWithLinks } from '@/features/emergency/components/ui/pagination-with-link.tsx';
import { useReportFrom } from '@/features/emergency/hooks/report-from.tsx';
import { useEffect } from 'react';

export default function ActivitiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
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
              <div key={r.id} className="mb-2">
                <Card className="h-20 w-full">
                  <CardContent>
                    <CardTitle>{r.description}</CardTitle>
                    {/*{r.image_url && (*/}
                    {/*    <img className="size-20" src={r.image_url}/>*/}
                    {/*)}*/}
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
