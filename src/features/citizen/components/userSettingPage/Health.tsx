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

  return (
    <div className="flex flex-col lg:gap-[27px]">
      <div className="flex lg:gap-[27px]">
        <div className="flex flex-col lg:gap-[13px]">
          <h2 className="font-medium lg:text-[20px]">Date of birth</h2>
          <input
            type="date"
            name="BirthDate"
            className="rounded-[10px] border border-[#00000040] bg-[#FAFAFA] text-[#2B5991] lg:h-[50px] lg:w-[332px] lg:gap-[10px] lg:px-[16px] lg:py-[13px] lg:text-[16px]"
            value={data.BirthDate}
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col lg:gap-[13px]">
          <h2 className="font-medium lg:text-[20px]">Blood Type</h2>
          <BloodTypeDropdown
            value={data.BloodType}
            onChange={(newValue) =>
              onDataChange({ ...data, BloodType: newValue })
            }
          />
        </div>
      </div>
      <div className="flex flex-col lg:gap-[13px]">
        <h2 className="font-medium lg:text-[20px]">Congenital Disease</h2>
        <input
          type="text"
          name="CongenitalDisease"
          className="rounded-[10px] border border-[#00000040] bg-[#FAFAFA] text-[#2B5991] lg:h-[50px] lg:w-[613px] lg:gap-[10px] lg:px-[16px] lg:py-[13px] lg:text-[16px]"
          value={data.CongenitalDisease}
          onChange={handleChange}
        />
      </div>
      <div className="flex flex-col lg:gap-[13px]">
        <h2 className="font-medium lg:text-[20px]">Allergic</h2>
        <input
          type="text"
          name="Allergic"
          className="rounded-[10px] border border-[#00000040] bg-[#FAFAFA] text-[#2B5991] lg:h-[50px] lg:w-[613px] lg:gap-[10px] lg:px-[16px] lg:py-[13px] lg:text-[16px]"
          value={data.Allergic}
          onChange={handleChange}
        />
      </div>
      <div className="flex flex-col lg:gap-[13px]">
        <h2 className="font-medium lg:text-[20px]">Insurance Number</h2>
        {/* Insurance Number */}
        <div className="flex items-center rounded-[10px] border border-[#00000040] bg-[#FAFAFA] text-[#2B5991] lg:h-[50px] lg:w-[613px] lg:gap-[10px] lg:px-[16px] lg:py-[13px] lg:text-[16px]">
          {data.Insurance}
        </div>
      </div>
      <div className="flex lg:gap-[27px]">
        <div className="flex flex-col lg:gap-[13px]">
          <h2 className="font-medium lg:text-[20px]">Height</h2>
          <input
            type="text"
            name="Height"
            className="rounded-[10px] border border-[#00000040] bg-[#FAFAFA] text-[#2B5991] lg:h-[50px] lg:w-[131px] lg:gap-[10px] lg:px-[16px] lg:py-[13px] lg:text-[16px]"
            value={data.Height}
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col gap-[13px]">
          <h2 className="text-[20px] font-medium">Weight</h2>
          <input
            type="text"
            name="Weight"
            className="rounded-[10px] border border-[#00000040] bg-[#FAFAFA] text-[#2B5991] lg:h-[50px] lg:w-[131px] lg:gap-[10px] lg:px-[16px] lg:py-[13px] lg:text-[16px]"
            value={data.Weight}
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col lg:gap-[13px]">
          <h2 className="font-medium lg:text-[20px]">Gender</h2>
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
