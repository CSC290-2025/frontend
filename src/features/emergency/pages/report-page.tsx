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
import MapInit from '@/features/emergency/components/modules/google-map/init-map.tsx';
import { Checkbox } from '@/features/emergency/components/ui/checkbox.tsx';
import { Label } from '@/features/emergency/components/ui/label';
import { Button } from '@/features/emergency/components/ui/button.tsx';
import { Textarea } from '@/features/emergency/components/ui/textarea.tsx';
import { AlertTriangle, Camera, Car, CircleAlert, Waves } from 'lucide-react';
import { useState } from 'react';
import { useGeoLocation } from '@/features/emergency/hooks/geo-location.tsx';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ReportOmit,
  type ReportRequestFrom,
} from '@/features/emergency/interfaces/report.ts';
import { useReportFrom } from '@/features/emergency/hooks/report-from.tsx';
import { DialogClose } from '@radix-ui/react-dialog';

const currentUser = { id: 123 };

function ReportPage() {
  const [showDetail, setShowDetail] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { findLocation, address } = useGeoLocation();
  const { createReport } = useReportFrom();

  const categories = [
    { name: 'Traffic', icon: <Car size={32} /> },
    { name: 'Accident', icon: <AlertTriangle size={32} /> },
    { name: 'Disaster', icon: <Waves size={32} /> },
  ];

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReportRequestFrom>({
    resolver: zodResolver(ReportOmit),
    defaultValues: {
      report_category: 'Traffic',
      ambulance_service: false,
      image_url: '',
      user_id: currentUser.id,
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      const res = await createReport(data);
      console.log('Report submitted:', res);
    } catch (err) {
      console.error('Failed to submit report:', err);
    }
  });

  return (
    <MapInit classname="rounded-2xl h-[calc(100svh-56px-16px)] lg:w-full sm:w-screen">
      <div className="grid h-full min-h-screen w-full grid-cols-7 grid-rows-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="secondary"
              iconLeft={<CircleAlert />}
              className="absolute z-100 col-start-1 row-start-3 m-5"
              onClick={findLocation}
            >
              Report
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-lg">
            <form onSubmit={onSubmit}>
              <DialogHeader>
                <DialogTitle>Confirm the location</DialogTitle>
                <DialogDescription asChild>
                  <div>
                    <Card className="mt-3">
                      <CardContent>
                        <CardDescription>
                          {address ? address : 'Fetching address'}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </div>
                </DialogDescription>
              </DialogHeader>

              {showDetail && (
                <div className="flex flex-col gap-6">
                  {/* Description */}
                  <div>
                    <DialogTitle className="mb-4">
                      What&#39;s happening?
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
                    <h2 className="mt-4 mb-4 text-lg font-semibold">
                      Select the category
                    </h2>
                    <Controller
                      name="report_category"
                      control={control}
                      render={({ field }) => (
                        <div className="flex justify-center gap-4">
                          {categories.map((cat) => (
                            <button
                              key={cat.name}
                              type="button"
                              onClick={() => field.onChange(cat.name)}
                              className={`flex h-24 w-24 flex-col items-center justify-center gap-2 rounded-xl border transition ${
                                field.value === cat.name
                                  ? 'border-black bg-black text-white'
                                  : 'border-transparent bg-gray-100 text-gray-500'
                              }`}
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
                              src={URL.createObjectURL(file)}
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
                              setFile(f);
                              field.onChange(URL.createObjectURL(f));
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
                  <Button type="submit">Confirm</Button>
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
