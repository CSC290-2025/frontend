import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/features/emergency/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
} from '@/features/emergency/components/modules/card/card.tsx';
import { Checkbox } from '@/features/emergency/components/ui/checkbox';
import { Label } from '@/features/emergency/components/ui/label';
import { Button } from '@/features/emergency/components/ui/button';
import { Textarea } from '@/features/emergency/components/ui/textarea';
import { Spinner } from '@/features/emergency/components/ui/spinner';
import MapInit from '@/features/emergency/components/modules/google-map/init-map';
import { AlertTriangle, Camera, Car, CircleAlert, Waves } from 'lucide-react';
import { useGeoLocation } from '@/features/emergency/contexts/geo-location';
import { useReportFrom } from '@/features/emergency/contexts/report-from';
import {
  ReportOmit,
  type ReportRequestFrom,
} from '@/features/emergency/types/report';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient.ts';

function ReportPage() {
  const [showDetail, setShowDetail] = useState(false);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  const { findLocation, address } = useGeoLocation();
  const { createReport, isLoading } = useReportFrom();

  const categories = [
    { name: 'Traffic', label: 'traffic', icon: <Car size={32} /> },
    { name: 'Accident', label: 'accident', icon: <AlertTriangle size={32} /> },
    { name: 'Disaster', label: 'disaster', icon: <Waves size={32} /> },
  ];

  //
  useEffect(() => {
    const fetchUserId = async () => {
      const me = await apiClient.get('/auth/me');
      setUserId(me.data.data.userId);
    };
    fetchUserId();
  }, []);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReportRequestFrom>({
    defaultValues: {
      title: 'test',
      ambulance_service: false,
    },
  });

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => setFile(reader.result?.toString() || null);
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      data.image_url = file;
      data.user_id = userId;
      data.lat = '13.652289';
      data.long = '100.493617';

      await createReport(data);

      reset();
      setOpen(false);
      setFile(null);
      setShowDetail(false);

      toast('Report successfully sent', { position: 'top-right' });
    } catch (err) {
      console.error('Failed to submit report:', err);
    }
  });

  return (
    <MapInit classname="h-[calc(100vh-75px)] lg:w-full sm:w-screen overflow-hidden">
      <div className="grid h-full min-h-screen w-full grid-cols-7 grid-rows-2">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              variant="secondary"
              iconLeft={<CircleAlert />}
              className="absolute bottom-5 left-5 z-50"
              onClick={findLocation}
            >
              Report
            </Button>
          </DialogTrigger>

          <DialogContent className="w-lg">
            <form onSubmit={onSubmit}>
              <DialogHeader>
                <DialogTitle>Confirm the location</DialogTitle>
                <DialogDescription asChild>
                  <Card className="mt-3">
                    <CardContent>
                      <CardDescription>
                        {address || 'Fetching address...'}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </DialogDescription>
              </DialogHeader>

              {showDetail && (
                <div className="flex flex-col gap-6">
                  <div>
                    <DialogTitle className="my-6">
                      What&apos;s happening?
                    </DialogTitle>

                    <Textarea
                      placeholder="Type something..."
                      {...register('description')}
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <h2 className="mb-6 text-lg font-semibold">
                      Select the category
                    </h2>

                    <Controller
                      name="report_category"
                      control={control}
                      render={({ field }) => (
                        <div className="flex justify-center gap-4">
                          {categories.map((cat) => {
                            const isActive = field.value === cat.label;

                            return (
                              <button
                                key={cat.label}
                                type="button"
                                onClick={() => field.onChange(cat.label)}
                                className={`flex h-24 w-24 flex-col items-center justify-center gap-2 rounded-xl border transition ${
                                  isActive
                                    ? 'border-black bg-black text-white'
                                    : 'border-transparent bg-gray-100 text-gray-500'
                                }`}
                              >
                                {cat.icon}
                                <span className="text-sm font-medium">
                                  {cat.name}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    />

                    {errors.report_category && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.report_category.message}
                      </p>
                    )}
                  </div>

                  {/* File Upload */}
                  <Controller
                    name="image_url"
                    control={control}
                    render={({ field }) => (
                      <label
                        htmlFor="file-upload"
                        className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-gray-300 p-3 hover:bg-gray-50"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500 text-white">
                          <Camera size={20} />
                        </div>

                        <span className="text-sm text-gray-600">
                          {file ? (
                            <img
                              src={file}
                              alt="Preview"
                              className="h-20 w-20 rounded-md object-cover"
                            />
                          ) : (
                            'Upload a picture file'
                          )}
                        </span>

                        <input
                          id="file-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const selected = e.target.files?.[0];
                            if (selected) {
                              handleFileUpload(selected);
                              field.onChange(selected);
                            }
                          }}
                        />
                      </label>
                    )}
                  />

                  {errors.image_url && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.image_url.message}
                    </p>
                  )}

                  {/* Ambulance */}
                  <div className="col-start-1 flex items-center gap-3">
                    <Controller
                      name="ambulance_service"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="ambulance"
                          checked={field.value as boolean}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />

                    <Label htmlFor="ambulance">Ambulance needed?</Label>

                    {errors.ambulance_service && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.ambulance_service.message}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Footer */}
              <DialogFooter className="mt-6 grid grid-cols-2 justify-between">
                <div className="col-start-1 flex items-center gap-3">
                  <Checkbox
                    id="details"
                    checked={showDetail}
                    onCheckedChange={(checked) => setShowDetail(!!checked)}
                  />
                  <Label htmlFor="details">Detail needed (optional)</Label>
                </div>

                <div className="flex justify-end gap-2">
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => reset()}
                    >
                      Close
                    </Button>
                  </DialogClose>

                  <Button type="submit">
                    {isLoading ? (
                      <>
                        <Spinner /> Sending...
                      </>
                    ) : (
                      'Confirm'
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </MapInit>
  );
}

export default ReportPage;
