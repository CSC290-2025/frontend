import { useNavigate, useSearchParams } from 'react-router';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/features/emergency/components/ui/dialog';
import {
  Card,
  CardContent,
} from '@/features/emergency/components/modules/card/card.tsx';
import { Badge } from '@/features/emergency/components/ui/badge.tsx';
import { PaginationWithLinks } from '@/features/emergency/components/ui/pagination-with-link.tsx';
import { useReportFrom } from '@/features/emergency/contexts/report-from.tsx';
import { useEffect, useState } from 'react';
import { Edit, ImageOff } from 'lucide-react';
import { Button } from '@/features/emergency/components/ui/button.tsx';
import { Label } from '@/components/ui/label.tsx';
import config from '@/features/emergency/config/env.ts';
import axios from 'axios';
import { apiClient } from '@/lib/apiClient.ts';

export default function ActivitiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const currentPage = parseInt(searchParams.get('_page') || '1', 10);
  const perPage = parseInt(searchParams.get('_limit') || '5', 10);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { report, isLoading, totalPage, setStatus } = useReportFrom();

  const [addressMap, setAddressMap] = useState<Record<string, string>>({});

  const convertPo = async (
    lat: string | null,
    long: string | null,
    id: number
  ) => {
    if (!lat || !long || addressMap[id]) return;

    try {
      const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${long}&apiKey=${config.GEO_API_KEY}`;
      const res = await axios.get(url);
      const formatted =
        res.data?.features?.[0]?.properties?.formatted ?? 'Unknown location';

      setAddressMap((prev) => ({ ...prev, [id]: formatted }));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    report.forEach((r) => {
      convertPo(r.lat, r.long, r.id);
    });
  }, [report]);

  const verifiedReports = report.filter((r) => r.status === 'verified');

  useEffect(() => {
    if (verifiedReports.length === 0) return;

    const createMarkers = async () => {
      for (const r of verifiedReports) {
        const data = {
          marker_type_id: 4,
          description: r.description,
          marker_type_icon: 'string',
          location: {
            lat: Number(r.lat),
            lng: Number(r.long),
          },
        };
        return await apiClient.post('/api/marker-types', data);
      }
    };
    console.log(createMarkers());
    createMarkers();
  }, [verifiedReports]);

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
          <TabsTrigger value="Ongoing" onClick={() => setStatus('pending')}>
            Ongoing
          </TabsTrigger>
          <TabsTrigger value="Complete" onClick={() => setStatus('resolved')}>
            Complete
          </TabsTrigger>
        </TabsList>

        <TabsContent value="Ongoing" className="mb-6">
          <div className="h-auto">
            {isLoading && <div className="p-4 text-center">Loading...</div>}

            {report.map((r) => {
              return (
                <div key={r.id} className="mb-6">
                  <Card className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white">
                    <CardContent className="p-5">
                      <div className="grid grid-cols-6 gap-4">
                        <Card
                          className="col-span-2 w-[150px] cursor-pointer overflow-hidden rounded-md bg-gray-50 py-0 transition-colors duration-200 hover:bg-gray-100 sm:col-span-1"
                          onClick={() =>
                            navigate(`${r.image_url}`, { replace: true })
                          }
                        >
                          {r.image_url ? (
                            <img
                              alt={r.title}
                              src={
                                r.image_url instanceof File
                                  ? URL.createObjectURL(r.image_url)
                                  : r.image_url
                              }
                              loading="eager"
                              className="aspect-square h-full w-full rounded-md object-cover"
                            />
                          ) : (
                            <div className="flex aspect-square h-full w-full flex-col items-center justify-center text-gray-400">
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
                          <div className="text-xs text-gray-500">
                            {addressMap[r.id] || 'Fetching address...'}
                          </div>
                          <div className="mt-4 text-sm text-gray-400">
                            {new Date(r.created_at).toLocaleDateString('en-EN')}
                          </div>

                          <div className="mt-auto flex items-center gap-2">
                            <Badge className="bg-gray-100 text-gray-700">
                              {r.status}
                            </Badge>
                            {/*<Button*/}
                            {/*  size="icon"*/}
                            {/*  onClick={() => handleEditClick()}*/}
                            {/*  className="h-8 w-8 rounded-full bg-gray-200 text-gray-700 transition-colors duration-200 hover:bg-gray-300"*/}
                            {/*>*/}
                            {/*  <Edit className="h-4 w-4" />*/}
                            {/*</Button>*/}
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
        <TabsContent value={'Complete'} className="mb-6">
          <div className="h-auto">
            {isLoading && <div className="p-4 text-center">Loading...</div>}

            {report.map((r) => {
              return (
                <div key={r.id} className="mb-6">
                  <Card className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white">
                    <CardContent className="p-5">
                      <div className="grid grid-cols-6 gap-4">
                        <Card
                          className="col-span-2 w-[150px] cursor-pointer overflow-hidden rounded-md bg-gray-50 py-0 transition-colors duration-200 hover:bg-gray-100 sm:col-span-1"
                          onClick={() =>
                            navigate(`${r.image_url}`, { replace: true })
                          }
                        >
                          {r.image_url ? (
                            <img
                              alt={r.title}
                              src={
                                r.image_url instanceof File
                                  ? URL.createObjectURL(r.image_url)
                                  : r.image_url
                              }
                              loading="eager"
                              className="aspect-square h-full w-full rounded-md object-cover"
                            />
                          ) : (
                            <div className="flex aspect-square h-full w-full flex-col items-center justify-center text-gray-400">
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
                          <div className="text-xs text-gray-500">
                            {addressMap[r.id] || 'Fetching address...'}
                          </div>

                          <div className="mt-auto flex items-center gap-2">
                            <Badge className="bg-gray-100 text-gray-700">
                              {r.status}
                            </Badge>
                            {/*<Button*/}
                            {/*  size="icon"*/}
                            {/*  onClick={() => handleEditClick()}*/}
                            {/*  className="h-8 w-8 rounded-full bg-gray-200 text-gray-700 transition-colors duration-200 hover:bg-gray-300"*/}
                            {/*>*/}
                            {/*  <Edit className="h-4 w-4" />*/}
                            {/*</Button>*/}
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

      {/*<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>*/}
      {/*  <DialogContent className="bg-white p-6 sm:max-w-[300px]">*/}
      {/*    <DialogHeader>*/}
      {/*      <DialogTitle className="mb-4 text-lg font-bold">*/}
      {/*        Update Status*/}
      {/*      </DialogTitle>*/}
      {/*    </DialogHeader>*/}

      {/*    <RadioGroup defaultValue="comfortable">*/}
      {/*      <div className="flex items-center gap-3">*/}
      {/*        <RadioGroupItem value="default" id="r1" />*/}
      {/*        <Label htmlFor="r1">Pending</Label>*/}
      {/*      </div>*/}
      {/*      <div className="flex items-center gap-3">*/}
      {/*        <RadioGroupItem value="comfortable" id="r2" />*/}
      {/*        <Label htmlFor="r2">Verified</Label>*/}
      {/*      </div>*/}
      {/*      <div className="flex items-center gap-3">*/}
      {/*        <RadioGroupItem value="compact" id="r3" />*/}
      {/*        <Label htmlFor="r3">Complete</Label>*/}
      {/*      </div>*/}
      {/*    </RadioGroup>*/}
      {/*    <DialogFooter>*/}
      {/*      <Button type="submit" onClick={() => setIsDialogOpen(false)}>*/}
      {/*        Confirm*/}
      {/*      </Button>*/}
      {/*    </DialogFooter>*/}
      {/*  </DialogContent>*/}
      {/*</Dialog>*/}
    </div>
  );
}
