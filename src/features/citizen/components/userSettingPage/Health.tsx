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
    <div className="flex flex-col gap-5 md:gap-6 lg:gap-[27px]">
      <div className="flex flex-col gap-4 md:flex-row md:gap-5 lg:gap-[27px]">
        <div className="flex flex-col gap-2 md:gap-3 lg:gap-[13px]">
          <h2 className="text-base font-medium md:text-lg lg:text-[20px]">
            Date of birth
          </h2>
          <input
            type="date"
            name="BirthDate"
            className="h-12 w-full rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-4 py-3 text-sm text-[#2B5991] md:h-[50px] md:w-[332px] md:text-base lg:h-[50px] lg:w-[332px] lg:gap-[10px] lg:px-[16px] lg:py-[13px] lg:text-[16px]"
            value={data.BirthDate}
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col gap-2 md:gap-3 lg:gap-[13px]">
          <h2 className="text-base font-medium md:text-lg lg:text-[20px]">
            Blood Type
          </h2>
          <BloodTypeDropdown
            value={data.BloodType}
            onChange={(newValue) =>
              onDataChange({ ...data, BloodType: newValue })
            }
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 md:gap-3 lg:gap-[13px]">
        <h2 className="text-base font-medium md:text-lg lg:text-[20px]">
          Congenital Disease
        </h2>
        <input
          type="text"
          name="CongenitalDisease"
          className="h-12 w-full rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-4 py-3 text-sm text-[#2B5991] md:h-[50px] md:w-[613px] md:text-base lg:h-[50px] lg:w-[613px] lg:gap-[10px] lg:px-[16px] lg:py-[13px] lg:text-[16px]"
          value={data.CongenitalDisease}
          onChange={handleChange}
        />
      </div>

      <div className="flex flex-col gap-2 md:gap-3 lg:gap-[13px]">
        <h2 className="text-base font-medium md:text-lg lg:text-[20px]">
          Allergic
        </h2>
        <input
          type="text"
          name="Allergic"
          className="h-12 w-full rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-4 py-3 text-sm text-[#2B5991] md:h-[50px] md:w-[613px] md:text-base lg:h-[50px] lg:w-[613px] lg:gap-[10px] lg:px-[16px] lg:py-[13px] lg:text-[16px]"
          value={data.Allergic}
          onChange={handleChange}
        />
      </div>

      <div className="flex flex-col gap-2 md:gap-3 lg:gap-[13px]">
        <h2 className="text-base font-medium md:text-lg lg:text-[20px]">
          Insurance Number
        </h2>
        <div className="flex h-12 w-full items-center rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-4 py-3 text-sm text-[#2B5991] md:h-[50px] md:w-[613px] md:text-base lg:h-[50px] lg:w-[613px] lg:gap-[10px] lg:px-[16px] lg:py-[13px] lg:text-[16px]">
          {data.Insurance}
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:gap-5 lg:gap-[27px]">
        <div className="flex flex-col gap-2 md:gap-3 lg:gap-[13px]">
          <h2 className="text-base font-medium md:text-lg lg:text-[20px]">
            Height
          </h2>
          <input
            type="text"
            name="Height"
            className="h-12 w-full rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-4 py-3 text-sm text-[#2B5991] md:h-[50px] md:w-[131px] md:text-base lg:h-[50px] lg:w-[131px] lg:gap-[10px] lg:px-[16px] lg:py-[13px] lg:text-[16px]"
            value={data.Height}
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col gap-2 md:gap-3 lg:gap-[13px]">
          <h2 className="text-base font-medium md:text-lg lg:text-[20px]">
            Weight
          </h2>
          <input
            type="text"
            name="Weight"
            className="h-12 w-full rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-4 py-3 text-sm text-[#2B5991] md:h-[50px] md:w-[131px] md:text-base lg:h-[50px] lg:w-[131px] lg:gap-[10px] lg:px-[16px] lg:py-[13px] lg:text-[16px]"
            value={data.Weight}
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col gap-2 md:gap-3 lg:gap-[13px]">
          <h2 className="text-base font-medium md:text-lg lg:text-[20px]">
            Gender
          </h2>
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
