//addlight

import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  child,
  set,
  onValue,
  off,
  get,
} from 'firebase/database';
import type { FirebaseApp } from 'firebase/app';
import type { Database, DataSnapshot } from 'firebase/database';
import { getBaseAPIURL } from '@/lib/apiClient.ts';
import { calculateGreenDuration } from '../components/calculateGreenDuration';
import { calculateRedDuration } from '../components/calculateRedDuration';

// กำหนดค่า Firebase (แทนที่ด้วยค่าโปรเจกต์ของคุณ!)
/*const firebaseConfig = {
    apiKey: "AIzaSyAVriFBgCdj6tFclCqyyXxBjoCJLmvy8nk",
    authDomain: "testapiforsmartcity.firebaseapp.com",
    databaseURL: "https://testapiforsmartcity-default-rtdb.asia-southeast1.firebasedatabase.app", 
    projectId: "testapiforsmartcity",
};*/

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase และ getDatabase นอก Component
let app: FirebaseApp;
let db: Database;

// การจัดการ Initialization
try {
  app = initializeApp(firebaseConfig);
  db = getDatabase(app);
} catch (error) {
  console.error(
    'Firebase initialization failed or was already initialized:',
    error
  );
  // ใช้ชื่ออื่นเพื่อเลี่ยง error (ใน production ควรจัดการด้วย getApp())
  app = initializeApp(firebaseConfig, 'secondaryAppForSafety');
  db = getDatabase(app);
}

// Interfaces
interface TrafficData {
  interid: number;
  roadid: number;
  lat: number;
  lng: number;
  marker_id: number;
  status: number;
  autoON: boolean;
  color: number;
  remaintime: number;
  green_duration: number;
  red_duration: number;
  density_level: number;
  timestamp: string;
}

interface TrafficLightPayload {
  status: number;
  current_color: number;
  auto_mode: boolean;
  ip_address: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  density_level: number;
  green_duration: number;
  red_duration: number;
  last_color: number;
}

interface TrafficLightResponse {
  success: boolean;
  data: {
    trafficLight: {
      id: number;
      ip_address: string;
      // ... อื่นๆ ตาม Response เต็ม
    };
  };
  message: string;
}

interface TrafficRecord extends TrafficData {
  key: string;
}

const TrafficDataForm: React.FC = () => {
  const [selectref, setSelectref] = useState<string>('teams/10/traffic_lights');
  const [updatemode, setUpdatemode] = useState<boolean>(false);
  const [backendmode, setBackendmode] = useState<boolean>(true);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);

  // **[เพิ่มใหม่]** State สำหรับ Custom Key
  const [newTrafficKey, setNewTrafficKey] = useState<string>('');

  // State สำหรับการเพิ่ม/อัปเดตข้อมูล Traffic
  const [interid, setInterid] = useState<string>('');
  const [roadid, setRoadid] = useState<string>('');
  const [lat, setLat] = useState<string>('');
  const [lng, setLng] = useState<string>('');
  const [marker_id, setMarker_id] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [autoON, setAutoON] = useState<boolean>(true);
  const [color, setColor] = useState<string>('');
  const [remaintime, setRemaintime] = useState<string>('');
  const [greenduration, setGreenduration] = useState<string>('');
  const [redduration, setRedduration] = useState<string>('');
  const [densitylevel, setDensitylevel] = useState<string>('');
  const [confirmKey, setConfirmKey] = useState<string>('');

  // State สำหรับการอัปเดต
  const [lightID, setlightID] = useState<string>('');
  const [lightkey, setlightkey] = useState<string>('');

  const [calcukey, setCalcukey] = useState<string>('');
  const [calcuinterid, setCalcuinterid] = useState<string>('');
  const [calcuRoadid, setCalcuroadid] = useState<string>('');

  const [Trafficlist, setTrafficList] = useState<TrafficRecord[]>([]);

  const [message, setMessage] = useState<{ text: string; isError: boolean }>({
    text: '',
    isError: false,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const initialTrafficLightData: TrafficLightPayload = {
    status: 0,
    current_color: 1,
    auto_mode: true,
    ip_address: '192.168.1.45',
    location: {
      type: 'Point',
      coordinates: [0, 0],
    },
    density_level: 0,
    green_duration: 0,
    red_duration: 0,
    last_color: 1,
  };

  const [formData, setFormData] = useState<TrafficLightPayload>(
    initialTrafficLightData
  );

  // --- ฟังก์ชันดึงข้อมูลแบบ Realtime ---

  const fetchTrafficRealtime = () => {
    const trafficRef = ref(db, selectref);

    const unsubscribe = onValue(
      trafficRef,
      (snapshot: DataSnapshot) => {
        const data = snapshot.val();
        const Traffics: TrafficRecord[] = [];

        if (data) {
          Object.keys(data).forEach((key) => {
            // ตรวจสอบว่าข้อมูลมีฟิลด์ที่จำเป็นหรือไม่
            if (data[key] && data[key].interid !== undefined) {
              Traffics.push({
                key: key,
                interid: Number(data[key].interid) || 0,
                roadid: Number(data[key].roadid) || 0,
                lat: Number(data[key].lat) || 0,
                lng: Number(data[key].lng) || 0,
                status: Number(data[key].status) || 0,
                marker_id: Number(data[key].marker_id) || 0,
                autoON: Boolean(data[key].autoON),
                color: Number(data[key].color) || 0,
                remaintime: Number(data[key].remaintime) || 0,
                green_duration: Number(data[key].green_duration) || 0,
                red_duration: Number(data[key].red_duration) || 0,
                density_level: Number(data[key].density_level) || 0,
                timestamp: String(data[key].timestamp) || '',
              });
            }
          });
        }

        setTrafficList(Traffics);
        console.log('Traffic Data fetched/updated successfully:', Traffics);
      },
      (error) => {
        console.error('Error fetching traffic data:', error);
        setMessage({
          text: `❌ Have problem with fetch data Traffic: ${error.message}`,
          isError: true,
        });
      }
    );

    return unsubscribe;
  };

  useEffect(() => {
    const cleanup = fetchTrafficRealtime();
    return () => {
      if (cleanup) {
        off(ref(db, selectref), 'value', cleanup as any);
      }
    };
  }, [selectref]);

  const addNewTrafficLight = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTrafficKey.trim()) {
      setMessage({
        text: 'Please fill in all required fields including a valid Key naaa!',
        isError: true,
      });
      console.log('Missing required fields or invalid Key');
      console.log(
        'data :',
        interid,
        roadid,
        lat,
        lng,
        status,
        color,
        remaintime,
        greenduration,
        redduration,
        densitylevel
      );
      return;
    }

    setIsLoading(true);
    setMessage({
      text: `⏳ saving new data Key: ${newTrafficKey} ...`,
      isError: false,
    });

    try {
      const newTrafficRef = ref(db, `${selectref}/${newTrafficKey.trim()}`);

      const trafficData: TrafficData = {
        interid: Number(interid),
        roadid: Number(roadid),
        lat: Number(lat),
        lng: Number(lng),
        marker_id: Number(newTrafficKey),
        status: Number(status),
        autoON: autoON,
        color: Number(color),
        remaintime: Number(remaintime),
        green_duration: Number(greenduration),
        red_duration: Number(redduration),
        density_level: Number(densitylevel),
        timestamp: new Date().toISOString(),
      };

      await set(newTrafficRef, trafficData);

      setMessage({
        text: `✅ Successfully send data to firebase! Key: ${newTrafficKey}`,
        isError: false,
      });
      setNewTrafficKey('');
      setInterid('');
      setRoadid('');
      setLat('');
      setLng('');
      setMarker_id('');
      setStatus('');
      setColor('');
      setRemaintime('');
      setGreenduration('');
      setRedduration('');
      setDensitylevel('');
    } catch (error: any) {
      console.error('Error writing new data to firebase ;-; :', error);
      setMessage({
        text: `X  failed to save data to firebase ahhhhh : ${error.message}`,
        isError: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const searchFromBackend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!lightID.trim()) {
      setMessage({
        text: 'Please provide a valid Key to search',
        isError: true,
      });
      return;
    }

    try {
      setIsLoading(true);
      const url = getBaseAPIURL + `/traffic-lights/${lightID.trim()}`;
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`Failed to fetch traffic light. Status: ${res.status}`);
      }
      const response: any = await res.json();
      console.log('Fetched traffic light details:', response);

      setNewTrafficKey(lightID.trim());
      setMarker_id(lightID.trim());
      setInterid(response.data.trafficLight.intersection_id);
      setRoadid(response.data.trafficLight.road_id);
      setLat(response.data.trafficLight.location.coordinates[1]);
      setLng(response.data.trafficLight.location.coordinates[0]);
      setStatus(response.data.trafficLight.status);
      setRemaintime(response.data.trafficLight.green_duration);
      setGreenduration(response.data.trafficLight.green_duration);
      setRedduration(response.data.trafficLight.red_duration);
      setDensitylevel(response.data.trafficLight.density_level || 0);
    } catch (err) {
      console.error('Error loading traffic light details', err);
      setMessage({
        text: 'Wrong ID or cannot fetch data from backend',
        isError: true,
      });
    } finally {
      setIsLoading(false);
      setlightID('');
    }
  };

  const searchfromfirebase = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const searchTerm = lightkey.trim();

    if (!lightkey.trim()) {
      setMessage({
        text: 'Please provide a valid Key to search',
        isError: true,
      });
      return;
    }

    try {
      setIsLoading(true);
      const trafficRef = child(ref(db), `${selectref}/${searchTerm}`);

      const snapshot: DataSnapshot = await get(trafficRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        if (data) {
          console.log('✅ Found traffic light details from firebase:', data);

          setNewTrafficKey(searchTerm);
          setMarker_id(searchTerm);
          setInterid(data.interid);
          setRoadid(data.roadid);
          setLat(data.lat);
          setLng(data.lng);
          setStatus(data.status || 0);
          setRemaintime(data.remaintime);
          setGreenduration(data.green_duration || 0);
          setRedduration(data.red_duration || 0);
          setDensitylevel(data.density_level || 0);

          setMessage({
            text: `✅ Successfully loaded data for Key: ${searchTerm}`,
            isError: false,
          });
        }
      } else {
        console.log(
          `Traffic Light with Key "${searchTerm}" not found at path: ${trafficRef.toString()}`
        );
        setMessage({
          text: `❌ Traffic Light with Key "${searchTerm}" not found.`,
          isError: true,
        });
      }
    } catch (err) {
      console.error('Error loading traffic light details', err);
      setMessage({
        text: 'Wrong ID or cannot fetch data from firebase',
        isError: true,
      });
    } finally {
      setIsLoading(false);
      setlightkey('');
    }
  };

  const handlefetch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const searchTerm = calcukey.trim();

    if (!calcukey.trim()) {
      setMessage({
        text: 'Please provide a valid Key to search',
        isError: true,
      });
      return;
    }

    try {
      setIsLoading(true);
      const trafficRef = child(ref(db), `${selectref}/${searchTerm}`);

      const snapshot: DataSnapshot = await get(trafficRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        if (data) {
          console.log('✅ Found traffic light details from firebase:', data);

          setCalcuinterid(data.interid);
          setCalcuroadid(data.roadid);

          setMessage({
            text: `✅ Successfully loaded data for Key: ${searchTerm}`,
            isError: false,
          });
        }
      } else {
        console.log(
          `Traffic Light with Key "${searchTerm}" not found at path: ${trafficRef.toString()}`
        );
        setMessage({
          text: `❌ Traffic Light with Key "${searchTerm}" not found.`,
          isError: true,
        });
      }
    } catch (err) {
      console.error('Error loading traffic light details', err);
      setMessage({
        text: 'Wrong ID or cannot fetch data from firebase',
        isError: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCalculate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const searchTerm = calcukey.trim();

    if (!calcukey.trim()) {
      setMessage({
        text: 'Please provide a valid Key to search',
        isError: true,
      });
      return;
    }

    try {
      setIsLoading(true);

      await calculateGreenDuration(
        Number(calcukey),
        Number(calcuinterid),
        Number(calcuRoadid)
      );

      await calculateRedDuration(Number(calcuinterid), db);

      setMessage({
        text: 'Complete calculate',
        isError: false,
      });
    } catch (err) {
      console.error('Error loading traffic light details', err);
    } finally {
      setIsLoading(false);
    }
  };

  const changeMode = () => {
    setBackendmode(!backendmode);
  };

  // --- ส่วน Render ของ Component ---
  return (
    <div className="m-2 mt-5 justify-self-center rounded-md border-1 border-gray-300 p-5 lg:w-250">
      {backendmode ? (
        <div>
          {message.text && (
            <div
              className={`${message.isError ? 'mb-3 rounded-md bg-red-200 p-3' : 'mb-3 rounded-md bg-green-200 p-3'}`}
            >
              {message.text}
            </div>
          )}

          <div className="mb-6 flex flex-row justify-between">
            <h1 className="w-full rounded-md bg-gradient-to-r from-green-400 to-blue-500 p-3 text-center font-bold text-white">
              🚦 Traffic Light management (Firebase Realtime DB)
            </h1>
            <button
              className="ml-5 rounded-md bg-gradient-to-r from-blue-500 to-blue-600 p-3 text-center font-bold text-white hover:from-blue-600 hover:to-blue-700"
              onClick={changeMode}
            >
              switch
            </button>
          </div>
          <hr />
          <div className="flex flex-row justify-between space-x-5">
            {/* -------------------- ภาค 1: เพิ่มข้อมูลใหม่ (กำหนด Key เอง) -------------------- */}
            <div className="rounded-md border p-5">
              <h2 className="mb-3 font-bold">Traffic Light Input</h2>
              <p className="mb-2 text-sm text-gray-400">
                Input Trafficlight data to add new light or update light with
                same id on firebase
              </p>
              <form onSubmit={addNewTrafficLight}>
                {/* **[เพิ่มใหม่]** Input สำหรับ Custom Key */}
                <div style={{ marginBottom: '15px' }}>
                  <label
                    htmlFor="newTrafficKey"
                    className="font-bold text-green-500"
                  >
                    Traffic Key (Traffic_id):
                  </label>
                  <input
                    id="newTrafficKey"
                    type="text"
                    value={newTrafficKey}
                    onChange={(e) => setNewTrafficKey(e.target.value)}
                    placeholder="Traffic_id"
                    className="mt-1 w-full rounded-sm border-2 border-green-500 p-2"
                    disabled={isLoading}
                    required
                  />
                </div>

                <hr style={{ margin: '15px 0' }} />

                <div style={{ marginBottom: '10px' }}>
                  <label htmlFor="interid">Intersection ID (interid):</label>
                  <input
                    id="interid"
                    type="number"
                    value={interid}
                    onChange={(e) => setInterid(e.target.value)}
                    placeholder="intersection_id"
                    className="mt-1 w-full rounded-sm border border-gray-300 p-2"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <label htmlFor="roadid">Road ID (roadid):</label>
                  <input
                    id="roadid"
                    type="number"
                    value={roadid}
                    onChange={(e) => setRoadid(e.target.value)}
                    placeholder="Road_id"
                    className="mt-1 w-full rounded-sm border border-gray-300 p-2"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <label htmlFor="lat">Latitude (lat):</label>
                  <input
                    id="lat"
                    type="number"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    placeholder="Example : 13.7563"
                    className="mt-1 w-full rounded-sm border border-gray-300 p-2"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <label htmlFor="lng">Longitude (lng):</label>
                  <input
                    id="lng"
                    type="text"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    placeholder="Example : 100.5018"
                    className="mt-1 w-full rounded-sm border border-gray-300 p-2"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <label htmlFor="status">
                    Status (0 = Normal, 1 = Broken, 2 = Maintenance) :
                  </label>
                  <input
                    id="status"
                    type="number"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    placeholder="0,1,2"
                    className="mt-1 w-full rounded-sm border border-gray-300 p-2"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <label
                    htmlFor="color"
                    style={{ display: 'block', marginBottom: '5px' }}
                  >
                    Current Color (number):
                  </label>
                  <select
                    id="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="mt-1 w-full rounded-sm border border-gray-300 p-2"
                    disabled={isLoading}
                    required
                  >
                    <option value="">--- select color ---</option>
                    <option value="1">1 (Red)</option>
                    <option value="2">2 (Yellow)</option>
                    <option value="3">3 (Green)</option>
                  </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label
                    htmlFor="remaintime"
                    style={{ display: 'block', marginBottom: '5px' }}
                  >
                    Remaining Time (remaintime):
                  </label>
                  <input
                    id="remaintime"
                    type="number"
                    value={remaintime}
                    onChange={(e) => setRemaintime(e.target.value)}
                    placeholder="in seconds"
                    className="mt-1 w-full rounded-sm border border-gray-300 p-2"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label
                    htmlFor="green_duration"
                    style={{ display: 'block', marginBottom: '5px' }}
                  >
                    green_duration (in seconds):
                  </label>
                  <input
                    id="green_duration"
                    type="number"
                    value={remaintime}
                    onChange={(e) => setGreenduration(e.target.value)}
                    placeholder="in seconds"
                    className="mt-1 w-full rounded-sm border border-gray-300 p-2"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label
                    htmlFor="red_duration"
                    style={{ display: 'block', marginBottom: '5px' }}
                  >
                    red_duration (in seconds):
                  </label>
                  <input
                    id="red_duration"
                    type="number"
                    value={redduration}
                    onChange={(e) => setRedduration(e.target.value)}
                    placeholder="in seconds"
                    className="mt-1 w-full rounded-sm border border-gray-300 p-2"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label
                    htmlFor="density_level"
                    style={{ display: 'block', marginBottom: '5px' }}
                  >
                    density_level (in number):
                  </label>
                  <input
                    id="density_level"
                    type="number"
                    value={densitylevel}
                    onChange={(e) => setDensitylevel(e.target.value)}
                    placeholder="in seconds"
                    className="mt-1 w-full rounded-sm border border-gray-300 p-2"
                    disabled={isLoading}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-lg bg-green-500 p-3 text-center font-bold text-white transition-colors duration-300 hover:bg-green-600"
                >
                  {isLoading ? 'saving...' : 'Save Traffic Light to DB'}
                </button>
              </form>
            </div>

            {/* -------------------- ภาค 2: อัปเดตข้อมูลที่มีอยู่ -------------------- */}
            <div className="rounded-md border p-5">
              <h2 className="mb-3 font-bold">Search Traffic light</h2>
              <p className="mb-2 text-sm text-gray-400">
                Search Traffic light and fetch data into input field from
                backend or firebase
              </p>
              <form onSubmit={(e) => searchFromBackend(e)}>
                <div style={{ marginBottom: '10px' }}>
                  <label htmlFor="lightID" className="font-bold text-blue-600">
                    Traffic Light ID :
                  </label>
                  <input
                    id="lightID"
                    type="text"
                    value={lightID}
                    onChange={(e) => setlightID(e.target.value)}
                    placeholder="Traffic Light ID in backend"
                    className="mt-1 w-full rounded-sm border-2 border-blue-600 p-2"
                    disabled={isLoading}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-md bg-blue-600 p-3 text-center font-bold text-white transition-colors duration-300 hover:bg-blue-700"
                >
                  {isLoading ? 'Searching...' : 'Search on backend'}
                </button>
              </form>

              <form className="mt-5" onSubmit={(e) => searchfromfirebase(e)}>
                <div className="mb-3">
                  <label
                    htmlFor="lightkey"
                    className="font-bold text-orange-600"
                  >
                    Traffic Light KEY :
                  </label>
                  <input
                    id="lightkey"
                    type="text"
                    value={lightkey}
                    onChange={(e) => setlightkey(e.target.value)}
                    placeholder="Traffic Light key in firebase"
                    className="mt-1 w-full rounded-sm border-2 border-orange-600 p-2"
                    disabled={isLoading}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-md bg-orange-600 p-3 text-center font-bold text-white transition-colors duration-300 hover:bg-orange-700"
                >
                  {isLoading ? 'Searching...' : 'Search on firebase'}
                </button>
              </form>

              <div className="my-5 h-100 rounded-md bg-gray-200">
                <div className="text-center text-sm">
                  <div className="py-45">
                    <p>สนใจติดต่อโฆษณา</p>
                    <p>Tel : 064-824-1987</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <hr style={{ marginTop: '20px' }} />

          {/* -------------------- ภาค 3: ตารางแสดงข้อมูล Traffic Realtime -------------------- */}
          <h2 className="mb-6 rounded-md bg-gradient-to-r from-green-400 to-blue-500 p-3 text-center font-bold text-white">
            📊 Traffic Light data in Realtime Database ({selectref})
          </h2>

          {Trafficlist.length === 0 ? (
            <p>no Traffic Light in firebase</p>
          ) : (
            <div className="max-h-120 overflow-x-auto overflow-y-scroll">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-t from-gray-300 to-gray-100">
                    <th
                      style={{ padding: '10px', border: '1px solid #000000ff' }}
                    >
                      Key
                    </th>
                    <th
                      style={{ padding: '10px', border: '1px solid #000000ff' }}
                    >
                      Inter ID
                    </th>
                    <th
                      style={{ padding: '10px', border: '1px solid #000000ff' }}
                    >
                      Road ID
                    </th>
                    <th
                      style={{ padding: '10px', border: '1px solid #000000ff' }}
                    >
                      Lat/Lng
                    </th>
                    <th
                      style={{ padding: '10px', border: '1px solid #000000ff' }}
                    >
                      Auto ON
                    </th>
                    <th
                      style={{ padding: '10px', border: '1px solid #000000ff' }}
                    >
                      Color
                    </th>
                    <th
                      style={{ padding: '10px', border: '1px solid #000000ff' }}
                    >
                      Remain Time
                    </th>
                    <th
                      style={{ padding: '10px', border: '1px solid #000000ff' }}
                    >
                      Green_duration
                    </th>
                    <th
                      style={{ padding: '10px', border: '1px solid #000000ff' }}
                    >
                      Red_duration
                    </th>
                    <th
                      style={{ padding: '10px', border: '1px solid #000000ff' }}
                    >
                      Density
                    </th>
                    <th
                      style={{ padding: '10px', border: '1px solid #000000ff' }}
                    >
                      status
                    </th>
                    <th
                      style={{ padding: '10px', border: '1px solid #000000ff' }}
                    >
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Trafficlist.map((traffic) => (
                    <tr
                      key={traffic.key}
                      style={{ borderBottom: '1px solid #000000ff' }}
                    >
                      <td
                        style={{
                          padding: '10px',
                          border: '1px solid #000000ff',
                        }}
                      >
                        {traffic.key}
                      </td>
                      <td
                        style={{
                          padding: '10px',
                          border: '1px solid #000000ff',
                        }}
                      >
                        {traffic.interid}
                      </td>
                      <td
                        style={{
                          padding: '10px',
                          border: '1px solid #000000ff',
                        }}
                      >
                        {traffic.roadid}
                      </td>
                      <td
                        style={{
                          padding: '10px',
                          border: '1px solid #000000ff',
                        }}
                      >
                        {traffic.lat}, {traffic.lng}
                      </td>
                      <td
                        style={{
                          padding: '10px',
                          border: '1px solid #000000ff',
                        }}
                      >
                        {traffic.autoON ? 'True' : 'False'}
                      </td>
                      <td
                        style={{
                          padding: '10px',
                          border: '1px solid #000000ff',
                        }}
                      >
                        {traffic.color}
                      </td>
                      <td
                        style={{
                          padding: '10px',
                          border: '1px solid #000000ff',
                        }}
                      >
                        {traffic.remaintime}s
                      </td>
                      <td
                        style={{
                          padding: '10px',
                          border: '1px solid #000000ff',
                        }}
                      >
                        {traffic.green_duration}s
                      </td>
                      <td
                        style={{
                          padding: '10px',
                          border: '1px solid #000000ff',
                        }}
                      >
                        {traffic.red_duration}s
                      </td>
                      <td
                        style={{
                          padding: '10px',
                          border: '1px solid #000000ff',
                        }}
                      >
                        {traffic.density_level}
                      </td>
                      <td
                        style={{
                          padding: '10px',
                          border: '1px solid #000000ff',
                        }}
                      >
                        {traffic.status}
                      </td>
                      <td
                        style={{
                          padding: '10px',
                          border: '1px solid #000000ff',
                          fontSize: '0.8em',
                        }}
                      >
                        {new Date(traffic.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="mb-6 flex flex-row justify-between">
            <h1 className="w-full rounded-md bg-gradient-to-r from-blue-400 to-purple-500 p-3 text-center font-bold text-white">
              🚦 Traffic Light management (backend DB)
            </h1>

            <button
              className="ml-5 rounded-md bg-gradient-to-r from-purple-500 to-purple-600 p-3 text-center font-bold text-white hover:from-purple-600 hover:to-purple-700"
              onClick={changeMode}
            >
              switch
            </button>
          </div>
          {message.text && (
            <div
              className={`${message.isError ? 'mb-3 rounded-md bg-red-200 p-3' : 'mb-3 rounded-md bg-green-200 p-3'}`}
            >
              {message.text}
            </div>
          )}
          <form onSubmit={handlefetch}>
            {/* Status Input */}
            <div style={{ marginBottom: '10px' }}>
              <label className="font-bold text-purple-600">Traffic Key :</label>
              <input
                type="number"
                name="calcukey"
                value={calcukey}
                onChange={(e) => setCalcukey(e.target.value)}
                required
                className="mt-1 w-full rounded-sm border-2 border-purple-600 p-2"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-purple-500 p-3 text-center font-bold text-white transition-colors duration-300 hover:bg-purple-600"
            >
              {isLoading ? 'fetching...' : 'Fetch Data'}
            </button>
          </form>

          <form onSubmit={handleCalculate}>
            <div className="mt-5">
              <label className="">Intersection ID :</label>
              <input
                type="number"
                name="calcuinterid"
                value={calcuinterid}
                onChange={(e) => setCalcuinterid(e.target.value)}
                required
                className="mt-1 w-full rounded-sm border-2 border-gray-300 p-2"
              />
            </div>
            <div>
              <label className="">Road ID :</label>
              <input
                type="number"
                name="calcuRoadid"
                value={calcuRoadid}
                onChange={(e) => setCalcuroadid(e.target.value)}
                required
                className="mt-1 w-full rounded-sm border-2 border-gray-300 p-2"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-5 w-full rounded-md bg-gradient-to-b from-purple-500 to-blue-500 p-3 text-center font-bold text-white transition-colors duration-300 hover:bg-orange-700 hover:from-purple-600 hover:to-blue-600"
            >
              {isLoading ? 'Calculating...' : 'Calculate'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default TrafficDataForm;
