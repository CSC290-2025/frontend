import axios from 'axios';

// --- Interfaces สำหรับโครงสร้างข้อมูล API ---

interface Location {
  type: string;
  coordinates: number[];
}

interface TrafficLightInIntersection {
  id: number;
  status: number;
  current_color: number;
  density_level: number;
  auto_mode: boolean;
  ip_address: string;
  location: Location;
}

interface IntersectionData {
  id: number;
  location: Location;
  traffic_lights: TrafficLightInIntersection[];
  // ... อื่นๆ
}

interface GetIntersectionResponse {
  success: boolean;
  data: {
    intersection: IntersectionData;
  };
}

interface TrafficLightDetail {
  id: number;
  intersection_id: number;
  green_duration: number;
  red_duration: number;
  status: number;
  current_color: number;
  auto_mode: boolean;
  ip_address: string;
  location: Location;
  density_level: number;
  last_color: number;
  // ... อื่นๆ
}

interface GetTrafficLightResponse {
  success: boolean;
  data: {
    trafficLight: TrafficLightDetail;
    timing: {
      greenDuration: number;
      yellowDuration: number;
      redDuration: number;
      totalCycle: number;
    };
  };
}

// ข้อมูลสำหรับอัปเดต (ตาม body ของ API PUT)
interface UpdateTrafficLightBody {
  status: number;
  current_color: number;
  auto_mode: boolean;
  ip_address: string;
  location: Location;
  density_level: number;
  green_duration: number;
  red_duration: number; // ค่าที่จะถูกคำนวณและอัปเดต
  last_color: number;
}

// --- การตั้งค่าพื้นฐาน ---

const baseUrl = 'http://localhost:3333';
const YELLOW_DURATION = 3; // สมมติว่า yellow duration = 3 วินาที (ตามข้อมูลตัวอย่าง)
const OFFSET_DURATION = 9; // ค่าคงที่ + 9

/**
 * คำนวณและอัปเดต red_duration ของสัญญาณไฟจราจรในสี่แยก
 * red_duration = (ผลรวม green_duration ของไฟอื่นๆ) + YELLOW_DURATION * (จำนวนไฟอื่น ๆ) + OFFSET_DURATION
 *
 * @param intersectionId ID ของสี่แยก
 */
export async function calculateTraffic(intersectionId: number): Promise<void> {
  try {
    // 1. ดึงข้อมูลสัญญาณไฟจราจรทั้งหมดในสี่แยก
    const intersectionRes = await axios.get<GetIntersectionResponse>(
      `${baseUrl}/intersections/${intersectionId}`
    );
    const trafficLights = intersectionRes.data.data.intersection.traffic_lights;

    if (trafficLights.length === 0) {
      console.log(`Intersection ID ${intersectionId} has no traffic lights.`);
      return;
    }

    // 2. ดึง green_duration ของสัญญาณไฟแต่ละดวง (Promise.all)
    const lightDetailsPromises = trafficLights.map((light) =>
      axios.get<GetTrafficLightResponse>(
        `${baseUrl}/traffic-lights/${light.id}`
      )
    );

    const lightDetailsResponses = await Promise.all(lightDetailsPromises);
    console.log('traffic light in this intersection = ', lightDetailsResponses);

    // 3. รวมข้อมูล TrafficLightDetail โดยใช้ค่า green_duration จากส่วน trafficLight
    const detailedLights: TrafficLightDetail[] = lightDetailsResponses.map(
      (res) => {
        // <--- 'res' คือ element ของ lightDetailsResponses
        const lightData = res.data.data.trafficLight; // ไม่ต้องเรียกใช้ timingData อีกต่อไป
        // คืนค่าอ็อบเจกต์ TrafficLightDetail ที่มี green_duration ที่ถูกต้อง
        return {
          ...lightData, // *** แก้ไขตรงนี้ให้ใช้ lightData.green_duration แทน ***
          green_duration: lightData.green_duration,
        };
      }
    );

    // 4. คำนวณ Red Duration ใหม่และอัปเดตแต่ละสัญญาณไฟ
    const updatesPromises = detailedLights.map((currentLight) => {
      // คำนวณผลรวม green_duration ของสัญญาณไฟ 'ทั้งหมด' ยกเว้นตัวเอง
      const sumOfOtherGreenDurations = detailedLights.reduce((sum, light) => {
        if (light.id !== currentLight.id) {
          return sum + light.green_duration;
        }
        return sum;
      }, 0);

      const OFFSET_DURATION = 9; // กำหนดค่าคงที่อีกครั้งใน scope นี้เพื่อความชัดเจน
      const newRedDuration = sumOfOtherGreenDurations + OFFSET_DURATION;

      console.log(
        `Light ID ${currentLight.id}: New Red Duration = ${newRedDuration} (${sumOfOtherGreenDurations} + ${OFFSET_DURATION})`
      );

      // อัปเดต Body
      const updateBody: UpdateTrafficLightBody = {
        status: currentLight.status,
        current_color: currentLight.current_color,
        auto_mode: currentLight.auto_mode,
        ip_address: currentLight.ip_address,
        location: currentLight.location,
        density_level: currentLight.density_level,
        green_duration: currentLight.green_duration,
        red_duration: newRedDuration,
        last_color: currentLight.last_color,
      };

      // ส่ง PUT request และ log ID ที่กำลังอัปเดต
      console.log(
        `Sending PUT request for Traffic Light ID: ${currentLight.id} with new Red Duration: ${newRedDuration}`
      );
      return axios.put(
        `${baseUrl}/traffic-lights/${currentLight.id}`,
        updateBody
      );
    });

    // รอให้การอัปเดตทั้งหมดเสร็จสิ้น
    await Promise.all(updatesPromises);

    console.log(
      `Successfully updated red_duration for all traffic lights in Intersection ID ${intersectionId}.`
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        `Error calculating or updating traffic for Intersection ID ${intersectionId}:`,
        error.message
      );
      console.error('API Response:', error.response?.data);
    } else {
      console.error(
        `An unexpected error occurred for Intersection ID ${intersectionId}:`,
        error
      );
    }
    throw new Error(
      `Failed to calculate and update traffic for intersection ${intersectionId}`
    );
  }
}
