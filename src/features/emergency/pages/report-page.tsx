import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/features/emergency/components/ui/alert-dialog';
import {
  Card,
  CardContent,
  CardDescription,
} from '@/features/emergency/components/ui/card.tsx';
import MapInit from '@/features/emergency/components/modules/google-map/init-map.tsx';
import { useReportFrom } from '@/features/emergency/hooks/report-from.tsx';
import { Checkbox } from '@/features/emergency/components/ui/checkbox.tsx';
import { Label } from '@/features/emergency/components/ui/label';
import { Button } from '@/features/emergency/components/ui/button.tsx';
import { CircleAlert } from 'lucide-react';

function ReportPage() {
  const { location, findLocation, address } = useReportFrom();

  return (
    <MapInit classname="rounded-2xl min-h-screen">
      <div className="grid h-full min-h-screen w-full grid-cols-7 grid-rows-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant={'secondary'}
              iconLeft={<CircleAlert />}
              className="col-start-1 row-start-3 m-5"
              onClick={findLocation}
            >
              Report
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm the location</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div>
                  <Card className="mt-3">
                    <CardContent>
                      <CardDescription>
                        {location ? address : 'Fetching location...'}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="grid grid-cols-2 justify-between">
              <div className="col-start-1 flex items-center gap-3">
                <Checkbox id="terms" />
                <Label htmlFor="terms">Detail needed (optional)</Label>
              </div>
              <div className="flex justify-end gap-2">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction>Confirm</AlertDialogAction>
              </div>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MapInit>
  );
}
export default ReportPage;
