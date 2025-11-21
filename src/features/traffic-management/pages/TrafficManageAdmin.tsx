import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import type { DatabaseReference } from 'firebase/database';
// ❌ ลบ import { Loader } ออกไป เพราะไม่ได้ใช้แล้ว
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'; // 🆕 นำเข้า Functional API

/**
 * Interface สำหรับข้อมูล Traffic Light
 */
interface TrafficData {
  interid: number;
  roadid: number;
  lat: number;
  lng: string;
  autoON: boolean;
  color: number; // 1: Red, 2: Yellow, 3: Green
  remaintime: number; // เวลาคงเหลือ (วินาที)
  timestamp: string; // เวลาที่อัปเดตล่าสุด
}

// ----------------------------------------------------
// 1. การกำหนดค่า (Configs)
// ----------------------------------------------------

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

// ดึง Google Maps API Key จาก Environment Variable
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// **กำหนด ID ของสี่แยกที่คุณต้องการติดตาม**
const Traffic_ID = 15;

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(app);
const trafficRef: DatabaseReference = ref(
  database,
  `teams/10/traffic_lights/${Traffic_ID}`
);

// ----------------------------------------------------
// 2. Logic สำหรับ Google Maps API
// ----------------------------------------------------

// ... (Imports เดิม) ...

// ----------------------------------------------------
// 2. Logic สำหรับ Google Maps API
// ----------------------------------------------------

// Interface สำหรับพิกัด
interface Coordinates {
  lat: number;
  lng: number;
}

// Interface สำหรับผลลัพธ์การเปรียบเทียบเวลาเดินทาง
interface TravelTimeComparison {
  actualTimeText: string;
  actualTimeSeconds: number;
  typicalTimeText: string;
  typicalTimeSeconds: number;
  distanceText: string;
}

// 🆕 แก้ไข Type Definition เพื่อรองรับ departureTime
interface CustomDistanceMatrixRequest
  extends google.maps.DistanceMatrixRequest {
  departureTime?: Date;
  trafficModel?: google.maps.TrafficModel;
}

/**
 * คำนวณเวลาเดินทางเปรียบเทียบ (Actual vs. Typical) โดยใช้ Google Maps Distance Matrix Service
 * ...
 */
const compareTravelTimes = (
  origin: Coordinates,
  destination: Coordinates
): Promise<TravelTimeComparison> => {
  if (typeof google === 'undefined' || !google.maps.DistanceMatrixService) {
    return Promise.reject(
      new Error('Google Maps Distance Matrix API is not loaded or available.')
    );
  }

  const service = new google.maps.DistanceMatrixService();
  const departureTime = new Date();

  return new Promise((resolve, reject) => {
    // สร้าง Request โดยใช้ Custom Type (ตามที่แก้ไขไปในรอบก่อน)
    const request: CustomDistanceMatrixRequest = {
      origins: [origin],
      destinations: [destination],
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC,

      departureTime: departureTime,
    };

    service.getDistanceMatrix(
      request as google.maps.DistanceMatrixRequest,
      (response, status) => {
        if (status === google.maps.DistanceMatrixStatus.OK) {
          const element = response?.rows[0]?.elements[0];

          if (element?.status === 'OK') {
            // 🚨 แก้ไขที่นี่: เปลี่ยน durationInTraffic เป็น duration_in_traffic
            const actualDuration =
              element.duration_in_traffic || element.duration;

            resolve({
              actualTimeText: actualDuration.text,
              actualTimeSeconds: actualDuration.value,
              typicalTimeText: element.duration.text,
              typicalTimeSeconds: element.duration.value,
              distanceText: element.distance.text,
            });
          } else {
            reject(
              new Error(`Element status: ${element?.status || 'UNKNOWN'}`)
            );
          }
        } else {
          reject(
            new Error(`Distance Matrix Request failed with status: ${status}`)
          );
        }
      }
    );
  });
};

// ----------------------------------------------------
// 3. Logic สำหรับ Traffic Light Countdown
// ----------------------------------------------------

// กำหนดเวลาสำหรับแต่ละสี (ในวินาที)
const COLOR_TIMES = {
  RED: 40,
  YELLOW: 5,
  GREEN: 30,
};

// Mapping สี (number) ไปยังชื่อสี (string)
const COLOR_MAP: { [key: number]: { name: string; time: number } } = {
  1: { name: 'Red', time: COLOR_TIMES.RED },
  2: { name: 'Yellow', time: COLOR_TIMES.YELLOW },
  3: { name: 'Green', time: COLOR_TIMES.GREEN },
};

/**
 * Component หลักสำหรับ Traffic Light Countdown
 */
const TrafficLightComponent: React.FC = () => {
  const [isMapsApiLoaded, setIsMapsApiLoaded] = useState(false);

  const [trafficData, setTrafficData] = useState<TrafficData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const [travelTime, setTravelTime] = useState<TravelTimeComparison | null>(
    null
  );
  const [destLng, setDestLng] = useState<string>('100.5683');
  const [destLat, setDestLat] = useState<string>('13.7380');

  // useCallback สำหรับ Logic การเปลี่ยนสี
  const getNextColorAndTime = useCallback(
    (currentData: TrafficData): Pick<TrafficData, 'color' | 'remaintime'> => {
      let newColor = currentData.color;
      let newTime: number;

      if (currentData.color === 3) {
        newColor = 2;
        newTime = COLOR_TIMES.YELLOW;
      } else if (currentData.color === 2) {
        newColor = 1;
        newTime = COLOR_TIMES.RED;
      } else {
        newColor = 3;
        newTime = COLOR_TIMES.GREEN;
      }

      return { color: newColor, remaintime: newTime };
    },
    []
  );

  // ----------------------------------------------------
  // 4. Effects
  // ----------------------------------------------------

  // 🆕 Effect 4.1: โหลด Google Maps Script ด้วย Functional API
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      console.error('VITE_GOOGLE_MAPS_API_KEY is not set.');
      return;
    }

    // 1. กำหนด Options (รวมถึง API Key)
    setOptions({
      key: GOOGLE_MAPS_API_KEY,
      //version: 'weekly',
      // libraries: [], // ไม่จำเป็นต้องระบุ libraries เมื่อใช้ importLibrary
    });

    // 2. เรียกโหลด library ที่จำเป็น (Maps Service จะโหลดเองเมื่อเรียกใช้ครั้งแรก)
    // เพื่อให้แน่ใจว่าโหลด API Script พื้นฐานเสร็จแล้ว
    importLibrary('core')
      .then(() => {
        setIsMapsApiLoaded(true);
        console.log('Google Maps API script loaded successfully.');
      })
      .catch((error) => {
        console.error('Failed to load Google Maps API:', error);
        setIsMapsApiLoaded(false);
      });
  }, []);

  // Effect 4.2: ฟังการเปลี่ยนแปลงข้อมูลจาก Firebase
  useEffect(() => {
    const unsubscribe = onValue(
      trafficRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const dataFromFirebase = snapshot.val() as TrafficData;
          if (
            dataFromFirebase &&
            typeof dataFromFirebase.remaintime === 'number'
          ) {
            setTrafficData(dataFromFirebase);
          } else {
            console.warn(
              'Invalid data structure received from Firebase:',
              dataFromFirebase
            );
          }
        } else {
          console.log('No data available for Traffic ID:', Traffic_ID);
          setTrafficData(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching data from Firebase:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Effect 4.3: Logic Countdown และ Update Firebase ทุกวินาที
  useEffect(() => {
    if (!trafficData || !trafficData.autoON) {
      return;
    }

    const intervalId = setInterval(async () => {
      if (isUpdating) return;
      setIsUpdating(true);

      let newData: TrafficData;

      if (trafficData.remaintime > 1) {
        newData = {
          ...trafficData,
          remaintime: trafficData.remaintime - 1,
          timestamp: new Date().toISOString(),
        };
      } else {
        const { color, remaintime } = getNextColorAndTime(trafficData);
        newData = {
          ...trafficData,
          color: color,
          remaintime: remaintime,
          timestamp: new Date().toISOString(),
        };
      }

      try {
        await update(trafficRef, {
          color: newData.color,
          remaintime: newData.remaintime,
          timestamp: newData.timestamp,
        });
      } catch (error) {
        console.error('Failed to update Firebase:', error);
      } finally {
        setIsUpdating(false);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [trafficData, getNextColorAndTime, isUpdating]);

  // Effect 4.4: คำนวณเวลาเดินทางเปรียบเทียบ
  useEffect(() => {
    if (!trafficData || !isMapsApiLoaded) return;

    const originLat = trafficData.lat;
    const originLng = parseFloat(trafficData.lng);
    const destinationLat = parseFloat(destLat);
    const destinationLng = parseFloat(destLng);

    if (isNaN(originLng) || isNaN(destinationLat) || isNaN(destinationLng)) {
      setTravelTime(null);
      return;
    }

    const origin: Coordinates = { lat: originLat, lng: originLng };
    const destination: Coordinates = {
      lat: destinationLat,
      lng: destinationLng,
    };

    compareTravelTimes(origin, destination)
      .then(setTravelTime)
      .catch((error) => {
        console.error('Failed to calculate travel time:', error.message);
        setTravelTime(null);
      });
  }, [trafficData, destLat, destLng, isMapsApiLoaded]);

  // ----------------------------------------------------
  // 5. Component Rendering
  // ----------------------------------------------------

  const displayColor = useMemo(
    () => (trafficData ? COLOR_MAP[trafficData.color].name : 'Unknown'),
    [trafficData]
  );

  if (loading) {
    return (
      <div className="loading-state">
        ⏳ กำลังโหลดข้อมูล Traffic Light ID: {Traffic_ID}...
      </div>
    );
  }

  if (!trafficData) {
    return (
      <div className="error-state">
        ❌ ไม่พบข้อมูล Traffic Light ID: {Traffic_ID}
      </div>
    );
  }

  // Logic การเปรียบเทียบเวลาเพื่อแสดงสถานะ
  let comparisonMessage: string = '';
  let comparisonColor: 'green' | 'red' | 'gray' = 'gray';

  if (travelTime) {
    const diffSeconds =
      travelTime.actualTimeSeconds - travelTime.typicalTimeSeconds;
    const diffMinutes = Math.round(diffSeconds / 60);

    if (diffMinutes > 3) {
      comparisonMessage = `(ช้ากว่าปกติ ${diffMinutes} นาที)`;
      comparisonColor = 'red';
    } else if (diffMinutes < -3) {
      comparisonMessage = `(เร็วกว่าปกติ ${Math.abs(diffMinutes)} นาที)`;
      comparisonColor = 'green';
    } else {
      comparisonMessage = `(ใกล้เคียงกับเวลาปกติ)`;
      comparisonColor = 'gray';
    }
  }

  // Styles (สำหรับแสดงผล)
  const trafficLightStyle: React.CSSProperties = {
    padding: '20px',
    borderRadius: '10px',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    backgroundColor: '#f9f9f9',
    maxWidth: '700px',
    margin: '50px auto',
    border: `5px solid ${displayColor === 'Red' ? '#e74c3c' : displayColor === 'Yellow' ? '#f1c40f' : '#2ecc71'}`,
  };

  const lightStyle: React.CSSProperties = {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    margin: '15px auto',
    border: '5px solid #333',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '3em',
    fontWeight: 'bold',
    color: '#fff',
  };

  const lightColorStyle: React.CSSProperties = {
    backgroundColor:
      displayColor === 'Red'
        ? '#e74c3c'
        : displayColor === 'Yellow'
          ? '#f1c40f'
          : displayColor === 'Green'
            ? '#2ecc71'
            : '#bdc3c7',
  };

  return (
    <div style={trafficLightStyle}>
      {/* -------------------- ส่วน Traffic Light -------------------- */}
      <h2 style={{ color: '#333' }}>🚦 สี่แยก ID: {trafficData.interid}</h2>
      <p>
        Road ID: {trafficData.roadid} | Origin Lat/Lng: **{trafficData.lat} /{' '}
        {trafficData.lng}**
      </p>
      <p
        style={{
          fontWeight: 'bold',
          color: trafficData.autoON ? '#27ae60' : '#c0392b',
        }}
      >
        Mode: **{trafficData.autoON ? 'Automatic ON' : 'Manual OFF'}**
      </p>
      <p style={{ fontSize: '0.7em', color: '#777' }}>
        อัปเดตล่าสุด: {new Date(trafficData.timestamp).toLocaleTimeString()}
      </p>
      <hr />

      <div style={{ ...lightStyle, ...lightColorStyle }}>
        {trafficData.remaintime}
      </div>
      <p
        style={{
          fontSize: '1.8em',
          fontWeight: 'bold',
          color: lightColorStyle.backgroundColor,
          marginTop: '-10px',
        }}
      >
        {displayColor} Light
      </p>
      <p style={{ marginTop: '10px' }}>
        **เวลาคงเหลือ:**{' '}
        <span style={{ fontSize: '2.5em', color: '#3498db' }}>
          {trafficData.remaintime}
        </span>{' '}
        วินาที
      </p>

      <hr style={{ margin: '20px 0' }} />

      {/* -------------------- ส่วนคำนวณเวลาเดินทาง -------------------- */}
      <h3>🗺️ คำนวณเวลาเดินทางเปรียบเทียบ</h3>
      {!isMapsApiLoaded && (
        <p style={{ color: 'orange' }}>⚠️ กำลังโหลด Google Maps API...</p>
      )}

      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '15px',
          justifyContent: 'center',
        }}
      >
        <label>
          Dest Lat:
          <input
            type="text"
            value={destLat}
            onChange={(e) => setDestLat(e.target.value)}
            style={{ marginLeft: '5px', padding: '5px', width: '80px' }}
          />
        </label>
        <label>
          Dest Lng:
          <input
            type="text"
            value={destLng}
            onChange={(e) => setDestLng(e.target.value)}
            style={{ marginLeft: '5px', padding: '5px', width: '80px' }}
          />
        </label>
      </div>

      {travelTime ? (
        <div style={{ textAlign: 'left', padding: '0 20px' }}>
          <p>ระยะทางรวม: **{travelTime.distanceText}**</p>
          <p>
            เวลาเดินทางปกติ (อ้างอิงประวัติ): **{travelTime.typicalTimeText}**
          </p>
          <p>
            เวลาเดินทางที่ใช้จริง (ปัจจุบัน):
            <span
              style={{
                fontWeight: 'bold',
                color: comparisonColor,
                marginLeft: '5px',
              }}
            >
              {travelTime.actualTimeText}
            </span>
          </p>
          <p
            style={{
              fontWeight: 'bold',
              color: comparisonColor,
              marginTop: '10px',
            }}
          >
            **สถานะจราจร:** {comparisonMessage}
          </p>
        </div>
      ) : (
        <p>
          ⚠️ กำลังรอข้อมูล (Maps Loaded: {isMapsApiLoaded ? 'YES' : 'NO'})
          หรือโปรดตรวจสอบพิกัดปลายทาง...
        </p>
      )}
    </div>
  );
};

export default TrafficLightComponent;
