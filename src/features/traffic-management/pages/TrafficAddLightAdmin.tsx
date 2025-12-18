import React, { useState, useEffect } from 'react';
import { ref, child, set, onValue, off, get } from 'firebase/database';
import type { DataSnapshot } from 'firebase/database';
import { getBaseAPIURL } from '@/lib/apiClient.ts';
import { calculateGreenDuration } from '../components/calculateGreenDuration';
import { calculateRedDuration } from '../components/calculateRedDuration';
import { useNavigate } from '@/router';
import { database as db } from '@/lib/firebase';
import {
  Settings,
  Search,
  Database,
  Plus,
  Calculator,
  ArrowLeftRight,
  AlertCircle,
  CheckCircle,
  Loader2,
  TrafficCone,
} from 'lucide-react';

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
  emergency_override: boolean;
  timestamp: string;
}

interface TrafficLightPayload {
  status: number;
  current_color: number;
  auto_mode: boolean;
  ip_address: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  density_level: number;
  green_duration: number;
  red_duration: number;
  last_color: number;
}

interface TrafficRecord extends TrafficData {
  key: string;
}

const TrafficDataForm: React.FC = () => {
  const navigate = useNavigate();
  const [selectref, setSelectref] = useState<string>('teams/10/traffic_lights');
  const [backendmode, setBackendmode] = useState<boolean>(true);

  const [newTrafficKey, setNewTrafficKey] = useState<string>('');

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
  const [emergency_override, setEmergency_override] = useState<boolean>(false);

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

  const fetchTrafficRealtime = () => {
    const trafficRef = ref(db, selectref);

    const unsubscribe = onValue(
      trafficRef,
      (snapshot: DataSnapshot) => {
        const data = snapshot.val();
        const Traffics: TrafficRecord[] = [];

        if (data) {
          Object.keys(data).forEach((key) => {
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
                emergency_override:
                  Boolean(data[key].emergency_override) || false,
                timestamp: String(data[key].timestamp) || '',
              });
            }
          });
        }

        setTrafficList(Traffics);
      },
      (error) => {
        console.error('Error fetching traffic data:', error);
        setMessage({
          text: `Error fetching traffic data: ${error.message}`,
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
        text: 'Please fill in all required fields including a valid Key',
        isError: true,
      });
      return;
    }

    setIsLoading(true);
    setMessage({
      text: `Saving new data with Key: ${newTrafficKey}...`,
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
        emergency_override: emergency_override,
        timestamp: new Date().toISOString(),
      };

      await set(newTrafficRef, trafficData);

      setMessage({
        text: `Successfully saved data to Firebase with Key: ${newTrafficKey}`,
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
      console.error('Error writing new data to firebase:', error);
      setMessage({
        text: `Failed to save data to Firebase: ${error.message}`,
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
        text: 'Please provide a valid ID to search',
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
      setEmergency_override(false);
      setMessage({
        text: `Successfully loaded data for ID: ${lightID}`,
        isError: false,
      });
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
          setEmergency_override(data.emergency_override || false);

          setMessage({
            text: `Successfully loaded data for Key: ${searchTerm}`,
            isError: false,
          });
        }
      } else {
        setMessage({
          text: `Traffic Light with Key "${searchTerm}" not found.`,
          isError: true,
        });
      }
    } catch (err) {
      console.error('Error loading traffic light details', err);
      setMessage({
        text: 'Wrong Key or cannot fetch data from Firebase',
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
          setCalcuinterid(data.interid);
          setCalcuroadid(data.roadid);

          setMessage({
            text: `Successfully loaded data for Key: ${searchTerm}`,
            isError: false,
          });
        }
      } else {
        setMessage({
          text: `Traffic Light with Key "${searchTerm}" not found.`,
          isError: true,
        });
      }
    } catch (err) {
      console.error('Error loading traffic light details', err);
      setMessage({
        text: 'Wrong Key or cannot fetch data from Firebase',
        isError: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCalculate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!calcukey.trim()) {
      setMessage({
        text: 'Please provide a valid Key to calculate',
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
        text: 'Calculation completed successfully',
        isError: false,
      });
    } catch (err) {
      console.error('Error calculating traffic light durations', err);
      setMessage({
        text: 'Error during calculation',
        isError: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const changeMode = () => {
    setBackendmode(!backendmode);
  };

  const inputClass =
    'mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed';
  const labelClass = 'block text-sm font-medium text-gray-700';
  const buttonPrimaryClass =
    'w-full rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="border-b border-gray-200 bg-slate-900 px-6 py-4 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <TrafficCone className="h-6 w-6" />
            <div>
              <h1 className="text-xl font-bold">Traffic Light Management</h1>
              <p className="text-sm text-slate-300">
                Firebase Realtime Database
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/traffic/admin')}
              className="flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium transition hover:bg-slate-600"
            >
              <Settings className="h-4 w-4" />
              Admin
            </button>
            <button
              onClick={changeMode}
              className="flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium transition hover:bg-slate-600"
            >
              <ArrowLeftRight className="h-4 w-4" />
              {backendmode ? 'Calculator' : 'Manager'}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl p-6">
        {/* Message Alert */}
        {message.text && (
          <div
            className={`mb-6 flex items-center gap-3 rounded-lg p-4 ${
              message.isError
                ? 'border border-red-200 bg-red-50 text-red-800'
                : 'border border-green-200 bg-green-50 text-green-800'
            }`}
          >
            {message.isError ? (
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
            ) : (
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
            )}
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        {backendmode ? (
          <>
            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Left Column - Input Form */}
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-slate-600" />
                    <h2 className="font-semibold text-gray-900">
                      Traffic Light Input
                    </h2>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Add new or update existing traffic light data
                  </p>
                </div>

                <form onSubmit={addNewTrafficLight} className="p-6">
                  <div className="space-y-4">
                    {/* Traffic Key */}
                    <div>
                      <label htmlFor="newTrafficKey" className={labelClass}>
                        Traffic Key (ID) <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="newTrafficKey"
                        type="text"
                        value={newTrafficKey}
                        onChange={(e) => setNewTrafficKey(e.target.value)}
                        placeholder="Enter traffic light ID"
                        className={`${inputClass} border-slate-400`}
                        disabled={isLoading}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="interid" className={labelClass}>
                          Intersection ID
                        </label>
                        <input
                          id="interid"
                          type="number"
                          value={interid}
                          onChange={(e) => setInterid(e.target.value)}
                          placeholder="e.g., 1"
                          className={inputClass}
                          disabled={isLoading}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="roadid" className={labelClass}>
                          Road ID
                        </label>
                        <input
                          id="roadid"
                          type="number"
                          value={roadid}
                          onChange={(e) => setRoadid(e.target.value)}
                          placeholder="e.g., 1"
                          className={inputClass}
                          disabled={isLoading}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="lat" className={labelClass}>
                          Latitude
                        </label>
                        <input
                          id="lat"
                          type="number"
                          step="any"
                          value={lat}
                          onChange={(e) => setLat(e.target.value)}
                          placeholder="e.g., 13.7563"
                          className={inputClass}
                          disabled={isLoading}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="lng" className={labelClass}>
                          Longitude
                        </label>
                        <input
                          id="lng"
                          type="text"
                          value={lng}
                          onChange={(e) => setLng(e.target.value)}
                          placeholder="e.g., 100.5018"
                          className={inputClass}
                          disabled={isLoading}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="status" className={labelClass}>
                          Status
                        </label>
                        <select
                          id="status"
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                          className={inputClass}
                          disabled={isLoading}
                          required
                        >
                          <option value="">Select status</option>
                          <option value="0">0 - Normal</option>
                          <option value="1">1 - Broken</option>
                          <option value="2">2 - Maintenance</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="color" className={labelClass}>
                          Current Color
                        </label>
                        <select
                          id="color"
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          className={inputClass}
                          disabled={isLoading}
                          required
                        >
                          <option value="">Select color</option>
                          <option value="1">1 - Red</option>
                          <option value="2">2 - Yellow</option>
                          <option value="3">3 - Green</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="remaintime" className={labelClass}>
                          Remain Time (s)
                        </label>
                        <input
                          id="remaintime"
                          type="number"
                          value={remaintime}
                          onChange={(e) => setRemaintime(e.target.value)}
                          placeholder="30"
                          className={inputClass}
                          disabled={isLoading}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="green_duration" className={labelClass}>
                          Green (s)
                        </label>
                        <input
                          id="green_duration"
                          type="number"
                          value={greenduration}
                          onChange={(e) => setGreenduration(e.target.value)}
                          placeholder="27"
                          className={inputClass}
                          disabled={isLoading}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="red_duration" className={labelClass}>
                          Red (s)
                        </label>
                        <input
                          id="red_duration"
                          type="number"
                          value={redduration}
                          onChange={(e) => setRedduration(e.target.value)}
                          placeholder="30"
                          className={inputClass}
                          disabled={isLoading}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="density_level" className={labelClass}>
                        Density Level
                      </label>
                      <input
                        id="density_level"
                        type="number"
                        value={densitylevel}
                        onChange={(e) => setDensitylevel(e.target.value)}
                        placeholder="0"
                        className={inputClass}
                        disabled={isLoading}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className={buttonPrimaryClass}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Database className="h-4 w-4" />
                          Save to Firebase
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column - Search Forms */}
              <div className="space-y-6">
                {/* Search from Backend */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                  <div className="border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Search className="h-5 w-5 text-blue-600" />
                      <h2 className="font-semibold text-gray-900">
                        Search from Backend
                      </h2>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Fetch traffic light data from API
                    </p>
                  </div>

                  <form onSubmit={searchFromBackend} className="p-6">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="lightID" className={labelClass}>
                          Traffic Light ID
                        </label>
                        <input
                          id="lightID"
                          type="text"
                          value={lightID}
                          onChange={(e) => setlightID(e.target.value)}
                          placeholder="Enter ID from backend"
                          className={`${inputClass} border-blue-300 focus:border-blue-500 focus:ring-blue-500`}
                          disabled={isLoading}
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isLoading ? 'Searching...' : 'Search Backend'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Search from Firebase */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                  <div className="border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-orange-600" />
                      <h2 className="font-semibold text-gray-900">
                        Search from Firebase
                      </h2>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Fetch traffic light data from Firebase
                    </p>
                  </div>

                  <form onSubmit={searchfromfirebase} className="p-6">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="lightkey" className={labelClass}>
                          Traffic Light Key
                        </label>
                        <input
                          id="lightkey"
                          type="text"
                          value={lightkey}
                          onChange={(e) => setlightkey(e.target.value)}
                          placeholder="Enter key from Firebase"
                          className={`${inputClass} border-orange-300 focus:border-orange-500 focus:ring-orange-500`}
                          disabled={isLoading}
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isLoading ? 'Searching...' : 'Search Firebase'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Traffic Data Table */}
            <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-slate-600" />
                  <h2 className="font-semibold text-gray-900">
                    Traffic Light Data
                  </h2>
                  <span className="ml-2 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                    {Trafficlist.length} records
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Real-time data from {selectref}
                </p>
              </div>

              {Trafficlist.length === 0 ? (
                <div className="p-12 text-center">
                  <Database className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="mt-4 text-gray-500">
                    No traffic lights found in Firebase
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="sticky top-0 bg-gray-50 text-xs text-gray-600 uppercase">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Key</th>
                          <th className="px-4 py-3 font-semibold">Inter</th>
                          <th className="px-4 py-3 font-semibold">Road</th>
                          <th className="px-4 py-3 font-semibold">Emergency</th>
                          <th className="px-4 py-3 font-semibold">Location</th>
                          <th className="px-4 py-3 font-semibold">Auto</th>
                          <th className="px-4 py-3 font-semibold">Color</th>
                          <th className="px-4 py-3 font-semibold">Remain</th>
                          <th className="px-4 py-3 font-semibold">Green</th>
                          <th className="px-4 py-3 font-semibold">Red</th>
                          <th className="px-4 py-3 font-semibold">Density</th>
                          <th className="px-4 py-3 font-semibold">Status</th>
                          <th className="px-4 py-3 font-semibold">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {Trafficlist.map((traffic) => (
                          <tr key={traffic.key} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900">
                              {traffic.key}
                            </td>
                            <td className="px-4 py-3">{traffic.interid}</td>
                            <td className="px-4 py-3">{traffic.roadid}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                  traffic.emergency_override
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {traffic.emergency_override ? 'Yes' : 'No'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-500">
                              {traffic.lat.toFixed(4)}, {traffic.lng.toFixed(4)}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                  traffic.autoON
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {traffic.autoON ? 'On' : 'Off'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                  traffic.color === 1
                                    ? 'bg-red-100 text-red-700'
                                    : traffic.color === 2
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-green-100 text-green-700'
                                }`}
                              >
                                {traffic.color === 1
                                  ? 'Red'
                                  : traffic.color === 2
                                    ? 'Yellow'
                                    : 'Green'}
                              </span>
                            </td>
                            <td className="px-4 py-3">{traffic.remaintime}s</td>
                            <td className="px-4 py-3">
                              {traffic.green_duration}s
                            </td>
                            <td className="px-4 py-3">
                              {traffic.red_duration}s
                            </td>
                            <td className="px-4 py-3">
                              {traffic.density_level}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                  traffic.status === 0
                                    ? 'bg-green-100 text-green-700'
                                    : traffic.status === 1
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-yellow-100 text-yellow-700'
                                }`}
                              >
                                {traffic.status === 0
                                  ? 'Normal'
                                  : traffic.status === 1
                                    ? 'Broken'
                                    : 'Fixing'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-500">
                              {new Date(traffic.timestamp).toLocaleTimeString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Calculator Mode */
          <div className="mx-auto max-w-xl">
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-slate-600" />
                  <h2 className="font-semibold text-gray-900">
                    Duration Calculator
                  </h2>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Calculate green and red durations based on density level
                </p>
              </div>

              <div className="space-y-6 p-6">
                <form onSubmit={handlefetch}>
                  <div className="space-y-4">
                    <div>
                      <label className={labelClass}>Traffic Key</label>
                      <input
                        type="text"
                        name="calcukey"
                        value={calcukey}
                        onChange={(e) => setCalcukey(e.target.value)}
                        required
                        className={inputClass}
                        placeholder="Enter traffic key"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full rounded-lg bg-gray-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isLoading ? 'Fetching...' : 'Fetch Data'}
                    </button>
                  </div>
                </form>

                <div className="border-t border-gray-200 pt-6">
                  <form onSubmit={handleCalculate}>
                    <div className="space-y-4">
                      <div>
                        <label className={labelClass}>Intersection ID</label>
                        <input
                          type="number"
                          name="calcuinterid"
                          value={calcuinterid}
                          onChange={(e) => setCalcuinterid(e.target.value)}
                          required
                          className={inputClass}
                          placeholder="Auto-filled from fetch"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Road ID</label>
                        <input
                          type="number"
                          name="calcuRoadid"
                          value={calcuRoadid}
                          onChange={(e) => setCalcuroadid(e.target.value)}
                          required
                          className={inputClass}
                          placeholder="Auto-filled from fetch"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className={buttonPrimaryClass}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Calculating...
                          </>
                        ) : (
                          <>
                            <Calculator className="h-4 w-4" />
                            Calculate Durations
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrafficDataForm;
