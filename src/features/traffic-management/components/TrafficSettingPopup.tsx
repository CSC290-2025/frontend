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
import { initializeApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import type { Database, DataSnapshot } from 'firebase/database';
import {
  getDatabase,
  ref,
  query,
  push,
  child,
  set,
  update,
  onValue,
  off,
  get,
} from 'firebase/database';

interface TrafficSettingPopupProps {
  open: boolean;
  Traffickey: string;
  onOpenChange: (open: boolean) => void;
  onSave?: (trafficLight: trafficLight) => void;
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let db: Database;

try {
  app = initializeApp(firebaseConfig);
  db = getDatabase(app);
} catch (error) {
  console.error(
    'Firebase initialization failed or was already initialized:',
    error
  );
  app = initializeApp(firebaseConfig, 'secondaryAppForSafety');
  db = getDatabase(app);
}

export default function TrafficSettingPopup({
  open,
  Traffickey,
  onOpenChange,
  onSave,
}: TrafficSettingPopupProps) {
  const [selectref, setSelectref] = useState<string>('teams/10/traffic_lights');

  const [interid, setInterid] = useState<string>('');
  const [roadid, setRoadid] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [autoON, setAutoON] = useState<boolean>(true);
  const [color, setColor] = useState<number>(0);
  const [remaintime, setRemaintime] = useState<string>('');
  const [greenduration, setGreenduration] = useState<string>('');
  const [redduration, setRedduration] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [Automode, setAutomode] = useState<boolean>(true);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);

  const [pendingUpdate, setPendingUpdate] = useState<trafficLight | null>(null);

  useEffect(() => {
    if (Traffickey && open) {
      searchfromfirebase();
    }
  }, [Traffickey, open]);

  const searchfromfirebase = async () => {
    if (!Traffickey.trim()) {
      console.log('invalid Key');
    }

    try {
      setIsLoading(true);
      const trafficRef = child(ref(db), `${selectref}/${Traffickey.trim()}`);

      const snapshot: DataSnapshot = await get(trafficRef);

      if (snapshot.exists()) {
        const data = snapshot.val();

        if (data) {
          console.log('✅ Found traffic light details from firebase:', data);
          setInterid(data.interid);
          setColor(data.color || 2);
          setRoadid(data.roadid);
          setAutoON(data.autoON);
          setStatus(data.status || 0);
          setRemaintime(data.remaintime);
          setGreenduration(data.green_duration || 0);
          setRedduration(data.red_duration || 0);
        }
      } else {
        console.log(
          `Traffic Light with Key "${Traffickey}" not found at path: ${trafficRef.toString()}`
        );
      }
    } catch (err) {
      console.error('Error loading traffic light details', err);
    } finally {
      setIsLoading(false);
    }
  };

  function handleSave() {
    if (!Traffickey) return;
    setConfirmOpen(true);
  }

  async function handleConfirm() {
    if (!Traffickey) return;
    setIsLoading(true);

    try {
      const updatePayload = {
        autoON: Automode,
        green_duration: Number(greenduration),
        red_duration: Number(redduration),
        timestamp: new Date().toISOString(),
      };

      await set(ref(db, `${selectref}/${Traffickey}`), updatePayload);
      onOpenChange(false);
      //calculateTraffic(Number(interid));
      setConfirmOpen(false);
    } catch (err) {
      console.error('Error updating traffic light', err);
      alert('Error saving traffic light. See console for details.');
    } finally {
      setIsLoading(false);
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
                  <div className="mx-auto text-2xl font-bold">{remaintime}</div>
                </div>
                <div className="flex w-1/2 flex-col rounded-lg bg-white p-4 shadow-md">
                  <div className="ml-2 font-bold">Intersection : {interid}</div>
                  <div className="ml-2 font-bold">Light NO : {Traffickey}</div>
                  {/*<div className="ml-2 text-xs font-bold">
                    Location : {roadname}
                  </div>*/}
                  <div className="ml-2 text-xs font-bold">
                    Auto-mode : {status ? 'on' : 'off'}
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
                    <p className="rounded-md border px-3 py-2">{redduration}</p>
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
                      onChange={(e) => setGreenduration(e.target.value)}
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
        description={`Are you sure you want to change the traffic light NO.${Traffickey} at intersection ${interid}? This process will impact the system`}
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
