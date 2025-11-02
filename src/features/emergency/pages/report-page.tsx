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
import { CircleAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useGeoLocation } from '@/features/emergency/hooks/geo-location.tsx';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ReportForm from '@/features/emergency/components/modules/report-form/report-form.tsx';
import {
  ReportOmit,
  type ReportRequestFrom,
} from '@/features/emergency/interfaces/report.ts';
import { useReportFrom } from '@/features/emergency/hooks/report-from.tsx';
import { DialogClose } from '@radix-ui/react-dialog';

function ReportPage() {
  const [showDetail, setShowDetail] = useState(false);
  const { findLocation, address } = useGeoLocation();
  const { createReport } = useReportFrom();

  const {
    handleSubmit,
    formState: { errors },
  } = useForm<ReportRequestFrom>({
    resolver: zodResolver(ReportOmit),
    defaultValues: {
      title: 'test',
      report_category: 'traffic',
      ambulance_service: false,
      image_url: 'kuy',
      user_id: null,
    },
  });

  const cancel = () => {
    setShowDetail(false);
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      const res = await createReport(data);
      console.log('Report submitted:', res);
    } catch (err) {
      console.error('Failed to submit report:', err);
    }
  });

  useEffect(() => {
    console.error(errors);
  }, [errors]);

  return (
    <MapInit classname=" h-[calc(100svh-56px-)] lg:w-full sm:w-screen">
      <div className="grid h-full min-h-screen w-full grid-cols-7 grid-rows-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="secondary"
              iconLeft={<CircleAlert />}
              className="absolute z-50 col-start-1 row-start-3 m-5"
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

              {showDetail && <ReportForm />}

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
                    <Button type="button" onClick={cancel} variant="secondary">
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
