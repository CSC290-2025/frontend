import { districtDetail } from '../mocks/data/districtDetail';

export default function CurrentAQICard() {
  return (
    <div>
      <h2 className="text-xl">Current Air Quality</h2>
      <div>
        <span className="text-4xl font-bold text-black">
          {districtDetail.currentData.aqi}{' '}
          <span className="text-xl font-medium">AQI</span>
        </span>
      </div>
    </div>
  );
}
