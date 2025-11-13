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
    <div className="flex flex-col gap-[27px]">
      <div className="flex gap-[27px]">
        <div className="flex flex-col gap-[13px]">
          <h2 className="text-[20px] font-medium">Date of birth</h2>
          <input
            type="date"
            name="BirthDate"
            className="h-[50px] w-[332px] gap-[10px] rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-[16px] py-[13px] text-[16px] text-[#2B5991]"
            value={data.BirthDate}
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col gap-[13px]">
          <h2 className="text-[20px] font-medium">Blood Type</h2>
          <BloodTypeDropdown
            value={data.BloodType}
            onChange={(newValue) =>
              onDataChange({ ...data, BloodType: newValue })
            }
          />
        </div>
      </div>
      <div className="flex flex-col gap-[13px]">
        <h2 className="text-[20px] font-medium">Congenital Disease</h2>
        <input
          type="text"
          name="CongenitalDisease"
          className="h-[50px] w-[613px] gap-[10px] rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-[16px] py-[13px] text-[16px] text-[#2B5991]"
          value={data.CongenitalDisease}
          onChange={handleChange}
        />
      </div>
      <div className="flex flex-col gap-[13px]">
        <h2 className="text-[20px] font-medium">Allergic</h2>
        <input
          type="text"
          name="Allergic"
          className="h-[50px] w-[613px] gap-[10px] rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-[16px] py-[13px] text-[16px] text-[#2B5991]"
          value={data.Allergic}
          onChange={handleChange}
        />
      </div>
      <div className="flex flex-col gap-[13px]">
        <h2 className="text-[20px] font-medium">Insurance Number</h2>
        {/* Insurance Number */}
        <div className="flex h-[50px] w-[613px] items-center gap-[10px] rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-[16px] py-[13px] text-[16px] text-[#2B5991]">
          {data.Insurance}
        </div>
      </div>
      <div className="flex gap-[27px]">
        <div className="flex flex-col gap-[13px]">
          <h2 className="text-[20px] font-medium">Height</h2>
          <input
            type="text"
            name="Height"
            className="h-[50px] w-[131px] gap-[10px] rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-[16px] py-[13px] text-[16px] text-[#2B5991]"
            value={data.Height}
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col gap-[13px]">
          <h2 className="text-[20px] font-medium">Weight</h2>
          <input
            type="text"
            name="Weight"
            className="h-[50px] w-[131px] gap-[10px] rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-[16px] py-[13px] text-[16px] text-[#2B5991]"
            value={data.Weight}
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col gap-[13px]">
          <h2 className="text-[20px] font-medium">Gender</h2>
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
