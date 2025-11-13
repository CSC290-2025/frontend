import { CitizenSetting } from '../../types';

interface PersonalPropsWithSetter extends CitizenSetting.PersonalProps {
  onDataChange: (newData: any) => void;
}

function Personal({ data, onDataChange }: PersonalPropsWithSetter) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onDataChange({
      ...data,
      [name]: value,
    });
  };

  return (
    <div className="flex flex-col gap-[27px]">
      {/* ID card number */}
      <div className="flex flex-col gap-[13px]">
        <h2 className="text-[20px] font-medium">ID card Number</h2>
        <input
          type="text"
          name="IdCardNumber"
          className="flex h-[50px] w-[332px] items-center gap-[10px] rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-[16px] py-[13px] text-[16px] text-[#2B5991]"
          value={data.IdCardNumber}
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
            name="Firstname"
            className="h-[50px] w-[194px] gap-[10px] rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-[16px] py-[13px] text-[16px] text-[#2B5991]"
            value={data.Firstname}
            onChange={handleChange}
          />
        </div>
        {/* Middle Name */}
        <div className="flex flex-col gap-[13px]">
          <h2 className="text-[20px] font-medium">Middle name</h2>
          <input
            type="text"
            name="Middlename"
            className="h-[50px] w-[194px] gap-[10px] rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-[16px] py-[13px] text-[16px] text-[#2B5991]"
            value={data.Middlename}
            onChange={handleChange}
          />
        </div>
        {/* Last Name */}
        <div className="flex flex-col gap-[13px]">
          <h2 className="text-[20px] font-medium">Last name</h2>
          <input
            type="text"
            name="Lastname"
            className="h-[50px] w-[194px] gap-[10px] rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-[16px] py-[13px] text-[16px] text-[#2B5991]"
            value={data.Lastname}
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
            <input
              type="text"
              name="Enthinicity"
              className="flex h-[50px] w-[167px] items-center gap-[10px] rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-[16px] py-[13px] text-[16px] text-[#2B5991]"
              value={data.Enthnicity}
              onChange={handleChange}
            />
          </div>
          {/* Nationality */}
          <div className="flex flex-col gap-[13px]">
            <h2 className="text-[20px] font-medium">Nationality</h2>
            <input
              type="text"
              name="Nationality"
              className="h-[50px] w-[167px] gap-[10px] rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-[16px] py-[13px] text-[16px] text-[#2B5991]"
              value={data.Nationality}
              onChange={handleChange}
            />
          </div>
          {/* Religion */}
          <div className="flex flex-col gap-[13px]">
            <h2 className="text-[20px] font-medium">Religion</h2>
            <input
              type="text"
              name="Religion"
              className="h-[50px] w-[167px] gap-[10px] rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-[16px] py-[13px] text-[16px] text-[#2B5991]"
              value={data.Religion}
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
              name="PhoneNumber"
              className="h-[50px] w-[246px] gap-[10px] rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-[16px] py-[13px] text-[16px] text-[#2B5991]"
              value={data.PhoneNumber}
              onChange={handleChange}
            />
          </div>
          {/* Emergency Contact - READ-ONLY */}
          <div className="flex flex-col gap-[13px]">
            <h2 className="text-[20px] font-medium">Emergency contact</h2>
            <div className="flex h-[50px] w-[246px] items-center gap-[10px] rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-[16px] py-[13px] text-[16px] text-[#2B5991]">
              {data.EmergencyContact}
            </div>
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
              name="AddressLine"
              className="h-[50px] w-[557px] gap-[10px] rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-[16px] py-[13px] text-[16px] text-[#2B5991]"
              value={data.AddressLine}
              onChange={handleChange}
            />
          </div>
          <div className="flex gap-[27px]">
            <div className="flex flex-col gap-[13px]">
              <h2 className="text-[20px] font-medium">Sub-district</h2>
              <input
                type="text"
                name="SubDistrict"
                className="h-[50px] w-[226px] gap-[10px] rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-[16px] py-[13px] text-[16px] text-[#2B5991]"
                value={data.SubDistrict}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col gap-[13px]">
              <h2 className="text-[20px] font-medium">District</h2>
              <input
                type="text"
                name="District"
                className="h-[50px] w-[226px] gap-[10px] rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-[16px] py-[13px] text-[16px] text-[#2B5991]"
                value={data.District}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="flex gap-[27px]">
            <div className="flex flex-col gap-[13px]">
              <h2 className="text-[20px] font-medium">Province</h2>
              <input
                type="text"
                name="Province"
                className="h-[50px] w-[226px] gap-[10px] rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-[16px] py-[13px] text-[16px] text-[#2B5991]"
                value={data.Province}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col gap-[13px]">
              <h2 className="text-[20px] font-medium">Postal Code</h2>
              <input
                type="text"
                name="PostalCode"
                className="h-[50px] w-[226px] gap-[10px] rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-[16px] py-[13px] text-[16px] text-[#2B5991]"
                value={data.PostalCode}
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
