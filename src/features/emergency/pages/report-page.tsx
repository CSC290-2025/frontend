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
import { Checkbox } from '@/features/emergency/components/ui/checkbox.tsx';
import { Label } from '@/features/emergency/components/ui/label';
import { Button } from '@/features/emergency/components/ui/button.tsx';
import { CircleAlert } from 'lucide-react';

function ReportPage() {
  return (
    <MapInit classname="rounded-2xl min-h-screen">
      <div className="grid h-full min-h-screen w-full grid-cols-7 grid-rows-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant={'secondary'}
              iconLeft={<CircleAlert />}
              className="col-start-1 row-start-3 m-5"
            >
              Report
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm the location</AlertDialogTitle>
              <AlertDialogDescription>
                <Card className="mt-3">
                  <CardContent>
                    <CardDescription>
                      Soi Phutthabucha 42, Khwaeng Bang Mot, Khet Thung Khru,
                      Krung Thep Maha Nakhon 10140
                    </CardDescription>
                  </CardContent>
                </Card>
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
