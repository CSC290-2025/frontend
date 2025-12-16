import { CitizenSetting } from '../../types';
import BloodTypeDropdown from './BloodTypeDropDown';
import GenderDropdown from './GenderDropDown';

interface HealthPropsWithSetter extends CitizenSetting.HeathProps {
  onDataChange: (newData: any) => void;
}

function Health({ data, onDataChange }: HealthPropsWithSetter) {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    onDataChange({
      ...data,
      [name]: value,
    });
  };

  const inputClass =
    'w-full rounded-lg border border-gray-200 bg-white text-gray-900 px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent hover:border-gray-300';
  const labelClass = 'font-medium text-gray-700 text-xs md:text-sm';
  const disabledInputClass =
    'w-full rounded-lg border border-gray-100 bg-gray-50 text-gray-500 px-3 py-2 text-sm cursor-not-allowed';

  return (
    <div className="flex w-full flex-col gap-4 md:gap-5">
      {/* Basic Health Info Section */}
      <div className="flex flex-col gap-3 rounded-xl border border-gray-100 p-4 shadow-lg md:p-5">
        <h1 className="text-base font-bold text-blue-900 md:text-lg">
          Basic Health Information
        </h1>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <h2 className={labelClass}>Date of Birth</h2>
            <input
              type="date"
              name="BirthDate"
              className={inputClass}
              value={data.BirthDate}
              onChange={handleChange}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <h2 className={labelClass}>Blood Type</h2>
            <BloodTypeDropdown
              value={data.BloodType}
              onChange={(newValue) =>
                onDataChange({ ...data, BloodType: newValue })
              }
            />
          </div>
        </div>
      </div>

      {/* Medical Conditions Section */}
      <div className="flex flex-col gap-3 rounded-xl border border-gray-100 p-4 shadow-lg md:p-5">
        <h1 className="text-base font-bold text-blue-900 md:text-lg">
          Medical Conditions
        </h1>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <h2 className={labelClass}>Congenital Disease</h2>
            <input
              type="text"
              name="CongenitalDisease"
              className={inputClass}
              value={data.CongenitalDisease}
              onChange={handleChange}
              placeholder="Enter any congenital diseases"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <h2 className={labelClass}>Allergies</h2>
            <input
              type="text"
              name="Allergic"
              className={inputClass}
              value={data.Allergic}
              onChange={handleChange}
              placeholder="Enter any allergies"
            />
          </div>
        </div>
      </div>

      {/* Insurance Section */}
      <div className="flex flex-col gap-3 rounded-xl border border-gray-100 p-4 shadow-lg md:p-5">
        <h1 className="text-base font-bold text-blue-900 md:text-lg">
          Insurance Information
        </h1>
        <div className="flex flex-col gap-1.5">
          <h2 className={labelClass}>Insurance Number</h2>
          <div className={disabledInputClass}>
            {data.Insurance || 'No insurance number'}
          </div>
        </div>
      </div>

      {/* Physical Measurements Section */}
      <div className="flex flex-col gap-3 rounded-xl border border-gray-100 p-4 shadow-lg md:p-5">
        <h1 className="text-base font-bold text-blue-900 md:text-lg">
          Physical Measurements
        </h1>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <h2 className={labelClass}>Height (cm)</h2>
            <input
              type="text"
              name="Height"
              className={inputClass}
              value={data.Height}
              onChange={handleChange}
              placeholder="Enter height"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <h2 className={labelClass}>Weight (kg)</h2>
            <input
              type="text"
              name="Weight"
              className={inputClass}
              value={data.Weight}
              onChange={handleChange}
              placeholder="Enter weight"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <h2 className={labelClass}>Gender</h2>
            <GenderDropdown
              value={data.Gender}
              onChange={(newValue) =>
                onDataChange({ ...data, Gender: newValue })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Health;
