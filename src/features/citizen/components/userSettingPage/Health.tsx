import { useState } from 'react';
import { CitizenSetting } from '../../types';
import BloodTypeDropdown from './BloodTypeDropDown';
import GenderDropdown from './GenderDropDown';

function Health({ data }: CitizenSetting.HeathProps) {
  const [editableData, setEditableData] = useState({
    birthDate: data.BirthDate,
    bloodType: data.BloodType,
    congenitalDisease: data.CongenitalDisease,
    allergic: data.Allergic,
    insurance: data.Insurance,
    height: data.Height,
    weight: data.Weight,
    gender: data.Gender,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditableData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <div className="flex flex-col gap-[27px]">
      <div className="flex gap-[27px]">
        <div className="flex flex-col gap-[13px]">
          <h2 className="text-[20px] font-medium">Date of birth</h2>
          <input
            type="date"
            name="birthDate"
            className="h-[50px] w-[332px] gap-[10px] rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-[16px] py-[13px] text-[16px] text-[#2B5991]"
            value={editableData.birthDate}
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col gap-[13px]">
          <h2 className="text-[20px] font-medium">Blood Type</h2>
          <BloodTypeDropdown
            value={editableData.bloodType}
            onChange={(newValue) =>
              setEditableData((prev) => ({ ...prev, bloodType: newValue }))
            }
          />
        </div>
      </div>
      <div className="flex flex-col gap-[13px]">
        <h2 className="text-[20px] font-medium">Congenital Disease</h2>
        <input
          type="text"
          name="congenitalDisease"
          className="h-[50px] w-[613px] gap-[10px] rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-[16px] py-[13px] text-[16px] text-[#2B5991]"
          value={editableData.congenitalDisease}
          onChange={handleChange}
        />
      </div>
      <div className="flex flex-col gap-[13px]">
        <h2 className="text-[20px] font-medium">Allergic</h2>
        <input
          type="text"
          name="allergic"
          className="h-[50px] w-[613px] gap-[10px] rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-[16px] py-[13px] text-[16px] text-[#2B5991]"
          value={editableData.allergic}
          onChange={handleChange}
        />
      </div>
      <div className="flex flex-col gap-[13px]">
        <h2 className="text-[20px] font-medium">Insurance Number</h2>
        <div className="h-[50px] w-[613px] gap-[10px] rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-[16px] py-[13px] text-[16px] text-[#2B5991]">
          {editableData.insurance}
        </div>
      </div>
      <div className="flex gap-[27px]">
        <div className="flex flex-col gap-[13px]">
          <h2 className="text-[20px] font-medium">Height</h2>
          <input
            type="text"
            name="height"
            className="h-[50px] w-[131px] gap-[10px] rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-[16px] py-[13px] text-[16px] text-[#2B5991]"
            value={editableData.height}
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col gap-[13px]">
          <h2 className="text-[20px] font-medium">Weight</h2>
          <input
            type="text"
            name="weight"
            className="h-[50px] w-[131px] gap-[10px] rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-[16px] py-[13px] text-[16px] text-[#2B5991]"
            value={editableData.weight}
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col gap-[13px]">
          <h2 className="text-[20px] font-medium">Gender</h2>
          <GenderDropdown
            value={editableData.gender}
            onChange={(newValue) =>
              setEditableData((prev) => ({ ...prev, gender: newValue }))
            }
          />
        </div>
      </div>
    </div>
  );
}

export default Health;
