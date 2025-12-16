import { useSearchParams } from 'react-router';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/features/emergency/components/ui/tabs';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/features/emergency/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/features/emergency/components/ui/dialog';
import {
  Card,
  CardContent,
} from '@/features/emergency/components/modules/card/card.tsx';
import { Badge } from '@/features/emergency/components/ui/badge.tsx';
import { PaginationWithLinks } from '@/features/emergency/components/ui/pagination-with-link.tsx';
import { useReportFrom } from '@/features/emergency/hooks/report-from.tsx';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { Edit, ImageOff } from 'lucide-react';
import { Button } from '@/features/emergency/components/ui/button.tsx';
import { Label } from '@/components/ui/label.tsx';

export default function ActivitiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const currentPage = parseInt(searchParams.get('_page') || '1', 10);
  const perPage = parseInt(searchParams.get('_limit') || '5', 10);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { report, isLoading, totalPage } = useReportFrom();

  const handleEditClick = () => {
    setIsDialogOpen(true);
  };

  useEffect(() => {
    console.log('Report data:', report);
  }, [report]);

  return (
    <div className="mx-auto w-full max-w-5xl p-2 sm:p-6">
      <div className="mb-6 flex items-center gap-2">
        <h1 className="text-3xl font-bold">Activities</h1>
      </div>

      <Tabs defaultValue="Ongoing" className="w-full">
        <TabsList>
          <TabsTrigger value="Ongoing">Ongoing</TabsTrigger>
          <TabsTrigger value="Complete">Complete</TabsTrigger>
        </TabsList>

        <TabsContent value="Ongoing" className="mb-6">
          <div className="h-auto">
            {isLoading && <div className="p-4 text-center">Loading...</div>}

            {report.map((r) => {
              return (
                <div key={r.id} className="mb-6">
                  <Card className="w-full overflow-hidden">
                    <CardContent className="p-5">
                      <div className="grid grid-cols-6">
                        <Card
                          className="col-span-2 w-[150px] overflow-hidden py-0 sm:col-span-1"
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
                              loading={'eager'}
                              className="aspect-square h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex aspect-square h-full w-full flex-col items-center justify-center bg-gray-100 text-gray-400">
                              <ImageOff className="mb-2 h-6 w-6 opacity-40" />
                              <span className="text-[10px] font-medium tracking-wider uppercase opacity-60">
                                No Image
                              </span>
                            </div>
                          )}
                        </Card>

                        <div className="col-span-4 flex flex-col justify-between gap-2 p-4">
                          <div className="font-medium text-gray-900">
                            {r.description}
                          </div>

                          <div className="mt-auto flex items-center gap-2">
                            <Badge>{r.status}</Badge>

                            {/* BUTTON: Triggers the dialog via state */}
                            <Button
                              size="icon"
                              onClick={() => handleEditClick()}
                              className="h-8 w-8 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white p-6 sm:max-w-[300px]">
          <DialogHeader>
            <DialogTitle className="mb-4 text-lg font-bold">
              Update Status
            </DialogTitle>
          </DialogHeader>

          <RadioGroup defaultValue="comfortable">
            <div className="flex items-center gap-3">
              <RadioGroupItem value="default" id="r1" />
              <Label htmlFor="r1">Pending</Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="comfortable" id="r2" />
              <Label htmlFor="r2">Verified</Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="compact" id="r3" />
              <Label htmlFor="r3">Complete</Label>
            </div>
          </RadioGroup>
          <DialogFooter>
            <Button type="submit" onClick={() => setIsDialogOpen(false)}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
