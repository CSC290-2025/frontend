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
import { Textarea } from '@/features/emergency/components/ui/textarea.tsx';
import { CircleAlert } from 'lucide-react';
import { useState } from 'react';
import { Car, AlertTriangle, Waves, Camera, Ambulance } from 'lucide-react';
import { useReportFrom } from '@/features/emergency/hooks/report-from.tsx';

function ReportPage() {
  const [showDetail, setShowDetail] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Traffic');
  const [file, setFile] = useState<File | null>(null);
  const [ambulance, setAmbulance] = useState(false);
  const { findLocation, address } = useReportFrom();

  const categories = [
    { name: 'Traffic', icon: <Car size={32} /> },
    { name: 'Accident', icon: <AlertTriangle size={32} /> },
    { name: 'Disaster', icon: <Waves size={32} /> },
  ];

  return (
    <MapInit classname="rounded-2xl h-[calc(100svh-56px-16px)] lg:w-full sm:w-screen">
      <div className="grid h-full min-h-screen w-full grid-cols-7 grid-rows-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="secondary"
              iconLeft={<CircleAlert />}
              className="absolute z-100 col-start-1 row-start-3 m-5"
              onClick={findLocation}
            >
              Report
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-lg">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm the location</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div>
                  <Card className="mt-3">
                    <CardContent>
                      <CardDescription>
                        {address ? `${address}` : 'Fetching address'}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>

            {showDetail && (
              <div className="flex flex-col gap-6">
                <div>
                  <AlertDialogTitle className="mb-4">
                    What&#39;s happen?
                  </AlertDialogTitle>
                  <Textarea placeholder="Type something..."></Textarea>
                  <h2 className="mt-4 mb-4 text-lg font-semibold">
                    Select the category
                  </h2>
                  <div className="flex justify-center gap-4">
                    {categories.map((cat) => (
                      <button
                        key={cat.name}
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`flex h-24 w-24 flex-col items-center justify-center gap-2 rounded-xl border transition ${
                          selectedCategory === cat.name
                            ? 'border-black bg-black text-white'
                            : 'border-transparent bg-gray-100 text-gray-500'
                        }`}
                      >
                        {cat.icon}
                        <span className="text-sm font-medium">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

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
                      <span className="text-sm text-gray-600">
                        Upload a picture file
                      </span>
                    )}
                  </span>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const file = e.target.files?.[0]; // safe access
                      if (file) {
                        setFile(file);
                      }
                    }}
                  />
                </label>

                <div className="col-start-1 flex items-center gap-3">
                  <Ambulance size={36} />
                  <Label htmlFor="details">Ambulance needed?</Label>
                  <Checkbox
                    id="details"
                    checked={ambulance}
                    onCheckedChange={(checked) => setAmbulance(!!checked)}
                  />
                </div>
              </div>
            )}
            <AlertDialogFooter className="mt-6 grid grid-cols-2 justify-between">
              <div className="col-start-1 flex items-center gap-3">
                <Checkbox
                  id="details"
                  checked={showDetail}
                  onCheckedChange={(checked) => setShowDetail(!!checked)}
                />
                <Label htmlFor="details">Detail needed (optional)</Label>
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
