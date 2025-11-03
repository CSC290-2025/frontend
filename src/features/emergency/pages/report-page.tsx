import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/features/emergency/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
} from '@/features/emergency/components/ui/card.tsx';
import { Checkbox } from '@/features/emergency/components/ui/checkbox.tsx';
import { Label } from '@/features/emergency/components/ui/label';
import { Button } from '@/features/emergency/components/ui/button.tsx';
import { Textarea } from '@/features/emergency/components/ui/textarea.tsx';
import { Spinner } from '@/features/emergency/components/ui/spinner.tsx';
import MapInit from '@/features/emergency/components/modules/google-map/init-map.tsx';
import { AlertTriangle, Camera, Car, CircleAlert, Waves } from 'lucide-react';
import { useGeoLocation } from '@/features/emergency/hooks/geo-location.tsx';
import { useReportFrom } from '@/features/emergency/hooks/report-from.tsx';
import {
  ReportOmit,
  type ReportRequestFrom,
} from '@/features/emergency/interfaces/report.ts';
import { DialogClose } from '@radix-ui/react-dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';

function ReportPage() {
  const [showDetail, setShowDetail] = useState(false);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<string | null>(null);
  const { findLocation, address } = useGeoLocation();
  const { createReport, isLoading } = useReportFrom();

  const categories = [
    { name: 'Traffic', icon: <Car size={32} />, label: 'traffic' },
    { name: 'Accident', icon: <AlertTriangle size={32} />, label: 'accident' },
    { name: 'Disaster', icon: <Waves size={32} />, label: 'disaster' },
  ];

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReportRequestFrom>({
    resolver: zodResolver(ReportOmit),
    defaultValues: {
      title: 'test',
      user_id: null,
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      console.log(data);
      data.image_url = file;
      await createReport(data);

      setOpen(false);
      setFile(null);
      setShowDetail(false);
      reset();

      toast('Report successfully sent', {
        position: 'top-right',
      });
    } catch (err) {
      console.error('Failed to submit report:', err);
    }
  });

  return (
    <MapInit classname="h-[calc(100svh-56px)] lg:w-full sm:w-screen">
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
                        {address ? address : 'Fetching address...'}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </DialogDescription>
              </DialogHeader>

              {showDetail && (
                <div className="flex flex-col gap-6">
                  {/* Description */}
                  <div>
                    <DialogTitle className="mt-4 mb-4">
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
                    <h2 className="mb-4 text-lg font-semibold">
                      Select the category
                    </h2>
                    <Controller
                      name="report_category"
                      control={control}
                      render={({ field }) => (
                        <div className="flex justify-center gap-4">
                          {categories.map((cat) => (
                            <button
                              key={cat.label}
                              type="button"
                              onClick={() => field.onChange(cat.label)}
                              className={`flex h-24 w-24 flex-col items-center justify-center gap-2 rounded-xl border transition ${
                                field.value === cat.label
                                  ? 'border-black bg-black text-white'
                                  : 'border-transparent bg-gray-100 text-gray-500'
                              }`}
                              {...register('report_category')}
                            >
                              {cat.icon}
                              <span className="text-sm font-medium">
                                {cat.name}
                              </span>
                            </button>
                          ))}
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
                            const f = e.target.files?.[0];
                            if (f) {
                              const reader = new FileReader();
                              reader.readAsDataURL(f);
                              reader.onloadend = () => {
                                setFile(reader.result?.toString() || null);
                              };
                              field.onChange(f);
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

                  {/* Ambulance Checkbox */}
                  <div className="col-start-1 flex items-center gap-3">
                    <Controller
                      name="ambulance_service"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="ambulance"
                          checked={field.value as boolean | undefined}
                          onCheckedChange={(checked) =>
                            field.onChange(!!checked)
                          }
                          {...register('ambulance_service')}
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
                    <Button type="button" variant="secondary">
                      Close
                    </Button>
                  </DialogClose>
                  {isLoading ? (
                    <Button type="submit">
                      <Spinner />
                      Sending...
                    </Button>
                  ) : (
                    <Button type="submit">Confirm</Button>
                  )}
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
