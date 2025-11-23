import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import ConfirmPopup from './Comfirmpopup';
import type { trafficLight } from '../types/traffic.types';
import { putTrafficLight } from '../api/signal.api';
import { initializeApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import type { DatabaseReference } from 'firebase/database';
import { calculateTraffic } from '../components/calculateTrafficFunction';
import { getBaseAPIURL } from '@/lib/apiClient.ts';

interface TrafficData {
  interid: number;
  roadid: number;
  lat: number;
  lng: number;
  autoON: boolean;
  color: number;
  remaintime: number;
  timestamp: string;
}

interface TrafficRecord extends TrafficData {
  key: string;
}

interface TrafficSettingPopupProps {
  open: boolean;
  Lkey: string | null;
  currentColor: number | null;
  remaintime: number | null;
  onOpenChange: (open: boolean) => void;
  onSave?: (trafficLight: trafficLight) => void;
}

// **โปรดแทนที่ด้วย Firebase Config ของคุณ**
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// **กำหนด ID ของสี่แยกที่คุณต้องการติดตาม**
const Traffic_ID = 15;

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(app);
const trafficRef: DatabaseReference = ref(
  database,
  `teams/10/traffic_lights/${Traffic_ID}`
);

export default function TrafficSettingPopup({
  open,
  Lkey,
  currentColor,
  remaintime,
  onOpenChange,
  onSave,
}: TrafficSettingPopupProps) {
  const [TrafficLight, setTrafficLight] = useState<TrafficRecord[]>([]);

  const [intersectionId, setIntersectionId] = useState(0);
  const [TrafficID, setTrafficID] = useState(0);
  const [color, setColor] = useState(0);
  const [duration, setDuration] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<trafficLight | null>(null);
  const [Automode, setAutomode] = useState(false);
  const [greenduration, setGreenduration] = useState(0);
  const [redduration, setRedduration] = useState(0);
  const [roadid, setRoadid] = useState(0);
  const [Lstatus, setLstatus] = useState(0);
  const [density, setDensity] = useState(0);
  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);
  const [roadname, setRoadname] = useState('');

  // Sync local state when the traffic light or open changes
  useEffect(() => {
    if (Lkey) {
      setTrafficID(Number(Lkey));

      (async () => {
        try {
          const url = getBaseAPIURL + `/traffic-lights/${Lkey}`;
          const res = await fetch(url);
          if (!res.ok) throw new Error('Failed to fetch traffic light');
          const response: any = await res.json();

          console.log('Current traffic data:', response.data.trafficLight);

          setColor(Number(currentColor));
          setDuration(Number(remaintime));

          setIntersectionId(response.data.trafficLight.intersection_id);
          setRoadid(response.data.trafficLight.road_id);
          setGreenduration(response.data.trafficLight.green_duration);
          setRedduration(response.data.trafficLight.red_duration);
          setAutomode(response.data.trafficLight.auto_mode);
          setLat(response.data.trafficLight.location.coordinates[1]);
          setLng(response.data.trafficLight.location.coordinates[0]);
          setLstatus(response.data.trafficLight.status);
          setDensity(response.data.trafficLight.density_level);

          /*const Rurl = getBaseAPIURL + `/roads/${roadid}`;
          const Rres = await fetch(Rurl);
          if (!Rres.ok) throw new Error('Failed to fetch Road');
          const RoadData: any = await Rres.json();

          console.log('This Road data:', RoadData);
          setRoadname(RoadData.data.name);*/
        } catch (err) {
          console.error('Error loading traffic light details', err);
          // fallback to values from the provided signal
          setColor(0);
          setGreenduration(0);
          setRedduration(0);
          setAutomode(false);
        }
      })();
    }
  }, [Lkey, open]);

  function handleSave() {
    if (!Lkey) return;
    const updated: trafficLight = {
      id: TrafficID,
      intersection_id: intersectionId,
      road_id: roadid,
      ip_address: '192.168.1.45',
      location: {
        type: 'Point',
        coordinates: [lng, lat],
      },
      status: Lstatus,
      current_color: color,
      density_level: density,
      auto_mode: Automode,
      green_duration: greenduration,
      red_duration: redduration,
      last_color: color,
      last_updated: new Date().toISOString(),
    };
    setPendingUpdate(updated);
    setConfirmOpen(true);
  }

  async function handleConfirm() {
    if (!pendingUpdate) return;

    // Build request body following the API shape (snake_case)
    const body = {
      status: pendingUpdate.status,
      current_color: pendingUpdate.current_color,
      auto_mode: pendingUpdate.auto_mode,
      ip_address: pendingUpdate.ip_address,
      location: pendingUpdate.location,
      density_level: pendingUpdate.density_level,
      green_duration: pendingUpdate.green_duration,
      red_duration: pendingUpdate.red_duration,
      last_color: pendingUpdate.last_color,
    } as any;

    try {
      const updatedFromServer = await putTrafficLight(TrafficID, body);
      console.log('Save data --> ', updatedFromServer);
      // Call onSave with the updated record (prefer server response)
      onSave?.(updatedFromServer ?? pendingUpdate);
      onOpenChange(false);
      setPendingUpdate(null);
      //เรียกฟังชั่นคำนวณ
      calculateTraffic(intersectionId);
      setConfirmOpen(false);
    } catch (err) {
      console.error('Error updating traffic light', err);
      alert('Error saving traffic light. See console for details.');
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Traffic light Settings</DialogTitle>
            <DialogDescription>
              View or edit settings for the selected traffic light.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2 py-2">
            <div>
              <label className="ml-2">Current Status</label>
              <div className="mt-1 flex flex-row gap-2 rounded-md bg-gray-200 p-2">
                <div className="row flex w-1/2 items-center gap-4 rounded-lg bg-white p-4 shadow-md">
                  {color == 1 ? (
                    <div className="h-15 w-15 rounded-full bg-red-500"></div>
                  ) : color == 2 ? (
                    <div className="h-15 w-15 rounded-full bg-yellow-400"></div>
                  ) : (
                    <div className="h-15 w-15 rounded-full bg-green-500"></div>
                  )}
                  <div className="mx-auto text-2xl font-bold">{duration}</div>
                </div>
                <div className="flex w-1/2 flex-col rounded-lg bg-white p-4 shadow-md">
                  <div className="ml-2 font-bold">
                    Intersection : {intersectionId}
                  </div>
                  <div className="ml-2 font-bold">Light NO : {TrafficID}</div>
                  {/*<div className="ml-2 text-xs font-bold">
                    Location : {roadname}
                  </div>*/}
                  <div className="ml-2 text-xs font-bold">
                    Auto-mode : {Automode ? 'on' : 'off'}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="ml-2">Edit Traffic light</label>
              <div className="mt-1 flex flex-col gap-2 rounded-md bg-gray-200 p-2">
                <div className="flex w-full items-center gap-4 rounded-lg bg-white p-4 shadow-md">
                  <div className="h-15 w-15 rounded-full bg-red-500"></div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium">
                      Red Duration (seconds)
                    </label>
                    <p>{redduration}</p>
                  </div>
                </div>
                <div className="row flex w-full items-center gap-4 rounded-lg bg-white p-4 shadow-md">
                  <div className="h-15 w-15 rounded-full bg-green-500"></div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium">
                      Green Duration (seconds)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={greenduration}
                      onChange={(e) => setGreenduration(Number(e.target.value))}
                      className="rounded-md border px-3 py-2"
                    />
                  </div>
                </div>
                <div>
                  <button
                    onClick={() => setAutomode(!Automode)}
                    className={`rounded-md px-6 py-2 font-medium text-white transition-all ${
                      Automode
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-gray-400 hover:bg-gray-500'
                    }`}
                  >
                    {Automode ? 'Auto Mode: ON' : 'Auto Mode: OFF'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmPopup
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirm Traffic light Settings"
        description={`Are you sure you want to change the traffic light NO.${TrafficID} at intersection ${intersectionId}? This process will impact the system`}
        confirmText="Confirm"
        cancelText="Cancel"
        onConfirm={handleConfirm}
      />
    </>
  );
}

{
  /*<div className="grid grid-cols-1 gap-1">
              <label className="text-sm font-medium">Current status</label>
              <input
                value={intersectionId}
                onChange={(e) => setIntersectionId(Number(e.target.value))}
                className="rounded-md border px-3 py-2"
                readOnly
              />
            </div>

                <div className="grid grid-cols-1 gap-1">
              <label className="text-sm font-medium">Color</label>
              <select
                value={color}
                onChange={(e) =>
                  setColor(e.target.value as TrafficLight['color'])
                }
                className="rounded-md border px-3 py-2"
              >
                <option value="red">Red</option>
                <option value="yellow">Yellow</option>
                <option value="green">Green</option>
              </select>
            </div> 
            
            <div className="grid grid-cols-1 gap-1">
              <label className="text-sm font-medium">Duration (seconds)</label>
              <input
                type="number"
                min={1}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="rounded-md border px-3 py-2"
              />
            </div>*/
}
