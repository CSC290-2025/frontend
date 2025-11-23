import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  push,
  set,
  update,
  onValue,
  off,
  get,
} from 'firebase/database';
import type { FirebaseApp } from 'firebase/app';
import type { Database, DataSnapshot } from 'firebase/database';

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
  lng: string;
  autoON: boolean;
  color: number;
  remaintime: number;
  timestamp: string;
}

interface TrafficRecord extends TrafficData {
  key: string;
}

const TrafficDataForm: React.FC = () => {
  const [selectref, setSelectref] = useState<string>('teams/10/traffic_lights');

  // **[เพิ่มใหม่]** State สำหรับ Custom Key
  const [newTrafficKey, setNewTrafficKey] = useState<string>('');

  // State สำหรับการเพิ่ม/อัปเดตข้อมูล Traffic
  const [interid, setInterid] = useState<string>('');
  const [roadid, setRoadid] = useState<string>('');
  const [lat, setLat] = useState<string>('');
  const [lng, setLng] = useState<string>('');
  const [autoON, setAutoON] = useState<boolean>(true);
  const [color, setColor] = useState<string>('');
  const [remaintime, setRemaintime] = useState<string>('');

  // State สำหรับการอัปเดต
  const [updateKey, setUpdateKey] = useState<string>('');
  const [updateRemainTime, setUpdateRemainTime] = useState<string>('');

  const [Trafficlist, setTrafficList] = useState<TrafficRecord[]>([]);

  const [message, setMessage] = useState<{ text: string; isError: boolean }>({
    text: '',
    isError: false,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
                lng: String(data[key].lng) || '',
                autoON: Boolean(data[key].autoON),
                color: Number(data[key].color) || 0,
                remaintime: Number(data[key].remaintime) || 0,
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
          text: `❌ ข้อผิดพลาดในการดึงข้อมูล Traffic: ${error.message}`,
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

  // --- ฟังก์ชัน 1: เพิ่มข้อมูลใหม่ (กำหนด Key เอง) ---
  // ใช้ set() แทน push()
  const addNewTrafficLight = async (e: React.FormEvent) => {
    e.preventDefault();

    // **[ปรับปรุง]** ตรวจสอบ Custom Key
    if (
      !newTrafficKey.trim() ||
      !interid ||
      !roadid ||
      !lat ||
      !lng ||
      color === '' ||
      remaintime === ''
    ) {
      setMessage({
        text: 'กรุณากรอก **Key ที่ต้องการ** และข้อมูลไฟจราจรให้ครบ',
        isError: true,
      });
      return;
    }

    setIsLoading(true);
    setMessage({
      text: `⏳ กำลังบันทึกข้อมูลไฟจราจรใหม่ Key: ${newTrafficKey} ...`,
      isError: false,
    });

    try {
      // **[ปรับปรุง]** สร้าง Reference ไปยัง Path ที่กำหนด Key เอง
      const newTrafficRef = ref(db, `${selectref}/${newTrafficKey.trim()}`);

      const trafficData: TrafficData = {
        interid: Number(interid),
        roadid: Number(roadid),
        lat: Number(lat),
        lng: lng.trim(),
        autoON: autoON,
        color: Number(color),
        remaintime: Number(remaintime),
        timestamp: new Date().toISOString(),
      };

      // **[ปรับปรุง]** ใช้ set() เพื่อบันทึกข้อมูล
      await set(newTrafficRef, trafficData);

      setMessage({
        text: `✅ บันทึกข้อมูลไฟจราจรใหม่สำเร็จ! Key: ${newTrafficKey}`,
        isError: false,
      });
      // ล้าง State
      setNewTrafficKey(''); // ล้าง Key ที่ใช้
      setInterid('');
      setRoadid('');
      setLat('');
      setLng('');
      setColor('');
      setRemaintime('');
    } catch (error: any) {
      console.error('Error writing new data:', error);
      setMessage({
        text: `❌ เกิดข้อผิดพลาดในการบันทึกข้อมูลใหม่ : ${error.message}`,
        isError: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- ฟังก์ชัน 2: อัปเดตข้อมูลที่มีอยู่ (Update) ---

  const updateTrafficLight = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!updateKey.trim() || updateRemainTime === '') {
      setMessage({
        text: 'กรุณากรอก Key และเวลาคงเหลือใหม่ให้ครบ',
        isError: true,
      });
      return;
    }

    setIsLoading(true);
    setMessage({ text: '⏳ กำลังอัปเดตข้อมูล...', isError: false });

    try {
      const trafficItemRef = ref(db, `${selectref}/` + updateKey.trim());

      const data = {
        remaintime: Number(updateRemainTime),
        lastUpdated: new Date().toISOString(),
      };

      await update(trafficItemRef, data);

      setMessage({
        text: `✅ อัปเดตเวลาคงเหลือ Key(id): ${updateKey} สำเร็จ!`,
        isError: false,
      });
      setUpdateKey('');
      setUpdateRemainTime('');
    } catch (error: any) {
      console.error('Error updating data:', error);
      setMessage({
        text: `❌ เกิดข้อผิดพลาดในการอัปเดต: ${error.message}`,
        isError: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- ส่วน Render ของ Component ---
  return (
    <div
      style={{
        padding: '20px',
        maxWidth: '1000px',
        margin: '20px auto',
        border: '1px solid #ccc',
        borderRadius: '8px',
      }}
    >
      <h1 style={{ textAlign: 'center' }}>
        🚦 จัดการข้อมูล Traffic Light (Firebase Realtime DB)
      </h1>

      {message.text && (
        <div
          style={{
            marginBottom: '15px',
            padding: '10px',
            backgroundColor: message.isError ? '#fdd' : '#dfd',
            border: `1px solid ${message.isError ? 'red' : 'green'}`,
          }}
        >
          {message.text}
        </div>
      )}

      <hr />

      <div style={{ display: 'flex', gap: '40px' }}>
        {/* -------------------- ภาค 1: เพิ่มข้อมูลใหม่ (กำหนด Key เอง) -------------------- */}
        <div
          style={{
            flex: 1,
            padding: '15px',
            border: '1px solid #eee',
            borderRadius: '4px',
          }}
        >
          <h2>🆕 เพิ่ม Traffic Light ใหม่ (Custom Key)</h2>
          <form onSubmit={addNewTrafficLight}>
            {/* **[เพิ่มใหม่]** Input สำหรับ Custom Key */}
            <div style={{ marginBottom: '15px' }}>
              <label
                htmlFor="newTrafficKey"
                style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontWeight: 'bold',
                }}
              >
                🔑 Traffic Key (ID ที่กำหนดเอง):
              </label>
              <input
                id="newTrafficKey"
                type="text"
                value={newTrafficKey}
                onChange={(e) => setNewTrafficKey(e.target.value)}
                placeholder="เช่น I101 (ต้องไม่ซ้ำใคร)"
                style={{
                  width: '100%',
                  padding: '8px',
                  boxSizing: 'border-box',
                  border: '2px solid #ffc107',
                }}
                disabled={isLoading}
                required
              />
            </div>

            <hr style={{ margin: '15px 0' }} />

            <div style={{ marginBottom: '10px' }}>
              <label
                htmlFor="interid"
                style={{ display: 'block', marginBottom: '5px' }}
              >
                Intersection ID (interid):
              </label>
              <input
                id="interid"
                type="number"
                value={interid}
                onChange={(e) => setInterid(e.target.value)}
                placeholder="เช่น 101"
                style={{
                  width: '100%',
                  padding: '8px',
                  boxSizing: 'border-box',
                }}
                disabled={isLoading}
                required
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label
                htmlFor="roadid"
                style={{ display: 'block', marginBottom: '5px' }}
              >
                Road ID (roadid):
              </label>
              <input
                id="roadid"
                type="number"
                value={roadid}
                onChange={(e) => setRoadid(e.target.value)}
                placeholder="เช่น 5"
                style={{
                  width: '100%',
                  padding: '8px',
                  boxSizing: 'border-box',
                }}
                disabled={isLoading}
                required
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label
                htmlFor="lat"
                style={{ display: 'block', marginBottom: '5px' }}
              >
                Latitude (lat):
              </label>
              <input
                id="lat"
                type="number"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="เช่น 13.7563"
                style={{
                  width: '100%',
                  padding: '8px',
                  boxSizing: 'border-box',
                }}
                disabled={isLoading}
                required
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label
                htmlFor="lng"
                style={{ display: 'block', marginBottom: '5px' }}
              >
                Longitude (lng):
              </label>
              <input
                id="lng"
                type="text"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="เช่น 100.5018"
                style={{
                  width: '100%',
                  padding: '8px',
                  boxSizing: 'border-box',
                }}
                disabled={isLoading}
                required
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label
                htmlFor="color"
                style={{ display: 'block', marginBottom: '5px' }}
              >
                Current Color (color):
              </label>
              <select
                id="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  boxSizing: 'border-box',
                }}
                disabled={isLoading}
                required
              >
                <option value="">--- เลือกสี ---</option>
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
                placeholder="เวลาคงเหลือ (วินาที)"
                style={{
                  width: '100%',
                  padding: '8px',
                  boxSizing: 'border-box',
                }}
                disabled={isLoading}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '10px 15px',
                backgroundColor: isLoading ? '#aaa' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {isLoading ? 'กำลังบันทึก...' : 'บันทึก Traffic Light ใหม่ (Set)'}
            </button>
          </form>
        </div>

        {/* -------------------- ภาค 2: อัปเดตข้อมูลที่มีอยู่ -------------------- */}
        <div
          style={{
            flex: 1,
            padding: '15px',
            border: '1px solid #eee',
            borderRadius: '4px',
          }}
        >
          <h2>อัปเดตข้อมูล (Update Path)</h2>
          <p style={{ fontSize: '0.9em', color: '#666' }}>
            อัปเดตฟิลด์ `remaintime` ใน Key ที่มีอยู่
          </p>
          <form onSubmit={updateTrafficLight}>
            <div style={{ marginBottom: '10px' }}>
              <label
                htmlFor="updateKey"
                style={{ display: 'block', marginBottom: '5px' }}
              >
                Traffic Light Key (Key ที่สร้างหรือกำหนดเอง):
              </label>
              <input
                id="updateKey"
                type="text"
                value={updateKey}
                onChange={(e) => setUpdateKey(e.target.value)}
                placeholder="Key (เช่น I101 หรือ -Mw_ABCD...)"
                style={{
                  width: '100%',
                  padding: '8px',
                  boxSizing: 'border-box',
                }}
                disabled={isLoading}
                required
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label
                htmlFor="updateRemainTime"
                style={{ display: 'block', marginBottom: '5px' }}
              >
                เวลาคงเหลือใหม่ (วินาที):
              </label>
              <input
                id="updateRemainTime"
                type="number"
                value={updateRemainTime}
                onChange={(e) => setUpdateRemainTime(e.target.value)}
                placeholder="เช่น 30"
                style={{
                  width: '100%',
                  padding: '8px',
                  boxSizing: 'border-box',
                }}
                disabled={isLoading}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '10px 15px',
                backgroundColor: isLoading ? '#aaa' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {isLoading ? 'กำลังอัปเดต...' : 'อัปเดตเวลาคงเหลือ'}
            </button>
          </form>
        </div>
      </div>

      <hr style={{ marginTop: '20px' }} />

      {/* -------------------- ภาค 3: ตารางแสดงข้อมูล Traffic Realtime -------------------- */}
      <h2 style={{ textAlign: 'center' }}>
        📊 ข้อมูล Traffic Light ใน Realtime Database ({selectref})
      </h2>

      {Trafficlist.length === 0 ? (
        <p>ยังไม่มีข้อมูล Traffic Light ในฐานข้อมูล</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginTop: '10px',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f4f4f4' }}>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>
                  Key
                </th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>
                  Inter ID
                </th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>
                  Road ID
                </th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>
                  Lat/Lng
                </th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>
                  Auto ON
                </th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>
                  Color
                </th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>
                  Remain Time
                </th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody>
              {Trafficlist.map((traffic) => (
                <tr
                  key={traffic.key}
                  style={{ borderBottom: '1px solid #eee' }}
                >
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {traffic.key}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {traffic.interid}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {traffic.roadid}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {traffic.lat}, {traffic.lng}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {traffic.autoON ? 'True' : 'False'}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {traffic.color}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {traffic.remaintime}s
                  </td>
                  <td
                    style={{
                      padding: '10px',
                      border: '1px solid #ddd',
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
  );
};

export default TrafficDataForm;
