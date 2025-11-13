import { useState } from 'react';
import { CitizenSetting } from '../../types';

function Personal({ data }: CitizenSetting.PersonalProps) {
  const [editableData, setEditableData] = useState({
    idCardNumber: data.IdCardNumber,
    firstname: data.Firstname,
    middleName: data.Middlename,
    lastName: data.Lastname,
    nationality: data.Nationality,
    religion: data.Religion,
    phoneNumber: data.PhoneNumber,
    emergencyContact: data.EmergencyContact,
    addressLine: data.AddressLine,
    subDistrict: data.SubDistrict,
    district: data.District,
    province: data.Province,
    postalCode: data.PostalCode,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditableData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <div className="flex flex-col gap-[27px]">
      {/* ID card Number */}
      <div className="flex flex-col gap-[13px]">
        <h2 className="text-[20px] font-medium">ID card Number</h2>
        <input
          type="text"
          name="idCardNumber"
          className="h-[50px] w-[332px] gap-[10px] rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-[16px] py-[13px] text-[16px] text-[#2B5991]"
          value={editableData.idCardNumber}
          onChange={handleChange}
        />
      </div>
      {/* Full Name */}
      <div className="flex gap-[27px]">
        {/* First Name */}
        <div className="flex flex-col gap-[13px]">
          <h2 className="text-[20px] font-medium">First name</h2>
          <input
            type="text"
            name="firstname"
            className="h-[50px] w-[194px] gap-[10px] rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-[16px] py-[13px] text-[16px] text-[#2B5991]"
            value={editableData.firstname}
            onChange={handleChange}
          />
        </div>
        {/* Middle Name */}
        <div className="flex flex-col gap-[13px]">
          <h2 className="text-[20px] font-medium">Middle name</h2>
          <input
            type="text"
            name="middleName"
            className="h-[50px] w-[194px] gap-[10px] rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-[16px] py-[13px] text-[16px] text-[#2B5991]"
            value={editableData.middleName}
            onChange={handleChange}
          />
        </div>
        {/* Last Name */}
        <div className="flex flex-col gap-[13px]">
          <h2 className="text-[20px] font-medium">Last name</h2>
          <input
            type="text"
            name="lastName"
            className="h-[50px] w-[194px] gap-[10px] rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-[16px] py-[13px] text-[16px] text-[#2B5991]"
            value={editableData.lastName}
            onChange={handleChange}
          />
        </div>
      </div>
      {/* Demographic */}
      <div className="flex flex-col gap-[27px]">
        <h1 className="text-[24px] font-semibold text-[#2B5991]">
          Demographic
        </h1>
        <div className="ml-[49px] flex gap-[27px]">
          {/* Enthnicity */}
          <div className="flex flex-col gap-[13px]">
            <h2 className="text-[20px] font-medium">Enthnicity</h2>
            <div className="h-[50px] w-[167px] gap-[10px] rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-[16px] py-[13px] text-[16px] text-[#2B5991]">
              {data.Enthnicity}
            </div>
          </div>
          {/* Nationality */}
          <div className="flex flex-col gap-[13px]">
            <h2 className="text-[20px] font-medium">Nationality</h2>
            <input
              type="text"
              name="nationality"
              className="h-[50px] w-[167px] gap-[10px] rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-[16px] py-[13px] text-[16px] text-[#2B5991]"
              value={editableData.nationality}
              onChange={handleChange}
            />
          </div>
          {/* Religion */}
          <div className="flex flex-col gap-[13px]">
            <h2 className="text-[20px] font-medium">Religion</h2>
            <input
              type="text"
              name="religion"
              className="h-[50px] w-[167px] gap-[10px] rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-[16px] py-[13px] text-[16px] text-[#2B5991]"
              value={editableData.religion}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
      {/*Contact*/}
      <div className="flex flex-col gap-[27px]">
        <h1 className="text-[24px] font-semibold text-[#2B5991]">Contact</h1>
        <div className="ml-[49px] flex gap-[27px]">
          {/* Phone Number */}
          <div className="flex flex-col gap-[13px]">
            <h2 className="text-[20px] font-medium">Phone number</h2>
            <input
              type="text"
              name="phoneNumber"
              className="h-[50px] w-[246px] gap-[10px] rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-[16px] py-[13px] text-[16px] text-[#2B5991]"
              value={editableData.phoneNumber}
              onChange={handleChange}
            />
          </div>
          {/* Emergency Contact */}
          <div className="flex flex-col gap-[13px]">
            <h2 className="text-[20px] font-medium">Emergency contact</h2>
            <input
              type="text"
              name="emergencyContact"
              className="h-[50px] w-[246px] gap-[10px] rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-[16px] py-[13px] text-[16px] text-[#2B5991]"
              value={editableData.emergencyContact}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
      {/* Address */}
      <div className="flex flex-col gap-[27px]">
        <h1 className="text-[24px] font-semibold text-[#2B5991]">Address</h1>
        <div className="ml-[49px] flex flex-col gap-[27px]">
          <div className="flex flex-col gap-[13px]">
            <h2 className="text-[20px] font-medium">Address line</h2>
            <input
              type="text"
              name="addressLine"
              className="h-[50px] w-[557px] gap-[10px] rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-[16px] py-[13px] text-[16px] text-[#2B5991]"
              value={editableData.addressLine}
              onChange={handleChange}
            />
          </div>
          <div className="flex gap-[27px]">
            <div className="flex flex-col gap-[13px]">
              <h2 className="text-[20px] font-medium">Sub-district</h2>
              <input
                type="text"
                name="subDistrict"
                className="h-[50px] w-[226px] gap-[10px] rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-[16px] py-[13px] text-[16px] text-[#2B5991]"
                value={editableData.subDistrict}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col gap-[13px]">
              <h2 className="text-[20px] font-medium">District</h2>
              <input
                type="text"
                name="district"
                className="h-[50px] w-[226px] gap-[10px] rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-[16px] py-[13px] text-[16px] text-[#2B5991]"
                value={editableData.district}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="flex gap-[27px]">
            <div className="flex flex-col gap-[13px]">
              <h2 className="text-[20px] font-medium">Province</h2>
              <input
                type="text"
                name="province"
                className="h-[50px] w-[226px] gap-[10px] rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-[16px] py-[13px] text-[16px] text-[#2B5991]"
                value={editableData.province}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col gap-[13px]">
              <h2 className="text-[20px] font-medium">Postal Code</h2>
              <input
                type="text"
                name="postalCode"
                className="h-[50px] w-[226px] gap-[10px] rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-[16px] py-[13px] text-[16px] text-[#2B5991]"
                value={editableData.postalCode}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Personal;
