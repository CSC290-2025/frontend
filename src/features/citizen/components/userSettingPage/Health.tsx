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

  // Shared class for consistent input styling
  const inputClass =
    'h-12 w-full rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-4 py-3 text-sm text-[#2B5991] md:h-[50px] md:text-base lg:h-[50px] lg:px-[16px] lg:py-[13px] lg:text-[16px]';
  const labelClass = 'text-base font-medium md:text-lg lg:text-[20px]';

  return (
    <div className="flex w-full flex-col gap-5 md:gap-6 lg:gap-[27px]">
      {/* Row 1: Date of Birth & Blood Type (2 Columns) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:gap-[27px]">
        <div className="flex flex-col gap-2 md:gap-3 lg:gap-[13px]">
          <h2 className={labelClass}>Date of birth</h2>
          <input
            type="date"
            name="BirthDate"
            className={inputClass}
            value={data.BirthDate}
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col gap-2 md:gap-3 lg:gap-[13px]">
          <h2 className={labelClass}>Blood Type</h2>
          <BloodTypeDropdown
            value={data.BloodType}
            onChange={(newValue) =>
              onDataChange({ ...data, BloodType: newValue })
            }
          />
        </div>
      </div>

      {/* Row 2: Congenital Disease (Full Width) */}
      <div className="flex flex-col gap-2 md:gap-3 lg:gap-[13px]">
        <h2 className={labelClass}>Congenital Disease</h2>
        <input
          type="text"
          name="CongenitalDisease"
          className={inputClass}
          value={data.CongenitalDisease}
          onChange={handleChange}
        />
      </div>

      {/* Row 3: Allergic (Full Width) */}
      <div className="flex flex-col gap-2 md:gap-3 lg:gap-[13px]">
        <h2 className={labelClass}>Allergic</h2>
        <input
          type="text"
          name="Allergic"
          className={inputClass}
          value={data.Allergic}
          onChange={handleChange}
        />
      </div>

      {/* Row 4: Insurance Number (Full Width) */}
      <div className="flex flex-col gap-2 md:gap-3 lg:gap-[13px]">
        <h2 className={labelClass}>Insurance Number</h2>
        <div className={`flex items-center ${inputClass}`}>
          {data.Insurance}
        </div>
      </div>

      {/* Row 5: Height, Weight, Gender (3 Columns) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5 lg:gap-[27px]">
        <div className="flex flex-col gap-2 md:gap-3 lg:gap-[13px]">
          <h2 className={labelClass}>Height</h2>
          <input
            type="text"
            name="Height"
            className={inputClass}
            value={data.Height}
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col gap-2 md:gap-3 lg:gap-[13px]">
          <h2 className={labelClass}>Weight</h2>
          <input
            type="text"
            name="Weight"
            className={inputClass}
            value={data.Weight}
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col gap-2 md:gap-3 lg:gap-[13px]">
          <h2 className={labelClass}>Gender</h2>
          <GenderDropdown
            value={data.Gender}
            onChange={(newValue) => onDataChange({ ...data, Gender: newValue })}
          />
        </div>
      </div>
    </div>
  );
}

export default Health;
