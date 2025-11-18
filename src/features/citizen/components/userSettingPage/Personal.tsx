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
    <div className="flex flex-col lg:gap-[27px]">
      {/* ID card number */}
      <div className="flex flex-col lg:gap-[13px]">
        <h2 className="font-medium lg:text-[20px]">ID card Number</h2>
        <input
          type="text"
          name="IdCardNumber"
          className="flex items-center gap-[10px] rounded-[10px] border border-[#00000040] bg-[#FAFAFA] text-[#2B5991] lg:h-[50px] lg:w-[332px] lg:px-[16px] lg:py-[13px] lg:text-[16px]"
          value={data.IdCardNumber}
          onChange={handleChange}
        />
      </div>
      {/* Full Name */}
      <div className="flex lg:gap-[27px]">
        {/* First Name */}
        <div className="flex flex-col lg:gap-[13px]">
          <h2 className="font-medium lg:text-[20px]">First name</h2>
          <input
            type="text"
            name="Firstname"
            className="rounded-[10px] border border-[#00000040] bg-[#FAFAFA] text-[#2B5991] lg:h-[50px] lg:w-[194px] lg:gap-[10px] lg:px-[16px] lg:py-[13px] lg:text-[16px]"
            value={data.Firstname}
            onChange={handleChange}
          />
        </div>
        {/* Middle Name */}
        <div className="flex flex-col lg:gap-[13px]">
          <h2 className="font-medium lg:text-[20px]">Middle name</h2>
          <input
            type="text"
            name="Middlename"
            className="rounded-[10px] border border-[#00000040] bg-[#FAFAFA] text-[#2B5991] lg:h-[50px] lg:w-[194px] lg:gap-[10px] lg:px-[16px] lg:py-[13px] lg:text-[16px]"
            value={data.Middlename}
            onChange={handleChange}
          />
        </div>
        {/* Last Name */}
        <div className="flex flex-col lg:gap-[13px]">
          <h2 className="font-medium lg:text-[20px]">Last name</h2>
          <input
            type="text"
            name="Lastname"
            className="rounded-[10px] border border-[#00000040] bg-[#FAFAFA] text-[#2B5991] lg:h-[50px] lg:w-[194px] lg:gap-[10px] lg:px-[16px] lg:py-[13px] lg:text-[16px]"
            value={data.Lastname}
            onChange={handleChange}
          />
        </div>
      </div>
      {/* Demographic */}
      <div className="flex flex-col lg:gap-[27px]">
        <h1 className="font-semibold text-[#2B5991] lg:text-[24px]">
          Demographic
        </h1>
        <div className="flex lg:ml-[49px] lg:gap-[27px]">
          {/* Enthnicity */}
          <div className="flex flex-col gap-[13px]">
            <h2 className="font-medium lg:text-[20px]">Enthnicity</h2>
            <input
              type="text"
              name="Enthnicity"
              className="flex items-center gap-[10px] rounded-[10px] border border-[#00000040] bg-[#FAFAFA] text-[#2B5991] lg:h-[50px] lg:w-[167px] lg:px-[16px] lg:py-[13px] lg:text-[16px]"
              value={data.Enthnicity}
              onChange={handleChange}
            />
          </div>
          {/* Nationality */}
          <div className="flex flex-col lg:gap-[13px]">
            <h2 className="font-medium lg:text-[20px]">Nationality</h2>
            <input
              type="text"
              name="Nationality"
              className="rounded-[10px] border border-[#00000040] bg-[#FAFAFA] text-[#2B5991] lg:h-[50px] lg:w-[167px] lg:gap-[10px] lg:px-[16px] lg:py-[13px] lg:text-[16px]"
              value={data.Nationality}
              onChange={handleChange}
            />
          </div>
          {/* Religion */}
          <div className="flex flex-col lg:gap-[13px]">
            <h2 className="font-medium lg:text-[20px]">Religion</h2>
            <input
              type="text"
              name="Religion"
              className="rounded-[10px] border border-[#00000040] bg-[#FAFAFA] text-[#2B5991] lg:h-[50px] lg:w-[167px] lg:gap-[10px] lg:px-[16px] lg:py-[13px] lg:text-[16px]"
              value={data.Religion}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
      {/*Contact*/}
      <div className="flex flex-col lg:gap-[27px]">
        <h1 className="font-semibold text-[#2B5991] lg:text-[24px]">Contact</h1>
        <div className="flex lg:ml-[49px] lg:gap-[27px]">
          {/* Phone Number */}
          <div className="flex flex-col lg:gap-[13px]">
            <h2 className="font-medium lg:text-[20px]">Phone number</h2>
            <input
              type="text"
              name="PhoneNumber"
              className="rounded-[10px] border border-[#00000040] bg-[#FAFAFA] text-[#2B5991] lg:h-[50px] lg:w-[246px] lg:gap-[10px] lg:px-[16px] lg:py-[13px] lg:text-[16px]"
              value={data.PhoneNumber}
              onChange={handleChange}
            />
          </div>
          {/* Emergency Contact - READ-ONLY */}
          <div className="flex flex-col lg:gap-[13px]">
            <h2 className="font-medium lg:text-[20px]">Emergency contact</h2>
            <div className="flex items-center rounded-[10px] border border-[#00000040] bg-[#FAFAFA] text-[#2B5991] lg:h-[50px] lg:w-[246px] lg:gap-[10px] lg:px-[16px] lg:py-[13px] lg:text-[16px]">
              {data.EmergencyContact}
            </div>
          </div>
        </div>
      </div>
      {/* Address */}
      <div className="flex flex-col lg:gap-[27px]">
        <h1 className="font-semibold text-[#2B5991] lg:text-[24px]">Address</h1>
        <div className="flex flex-col lg:ml-[49px] lg:gap-[27px]">
          <div className="flex flex-col lg:gap-[13px]">
            <h2 className="font-medium lg:text-[20px]">Address line</h2>
            <input
              type="text"
              name="AddressLine"
              className="rounded-[10px] border border-[#00000040] bg-[#FAFAFA] text-[#2B5991] lg:h-[50px] lg:w-[557px] lg:gap-[10px] lg:px-[16px] lg:py-[13px] lg:text-[16px]"
              value={data.AddressLine}
              onChange={handleChange}
            />
          </div>
          <div className="flex lg:gap-[27px]">
            <div className="flex flex-col lg:gap-[13px]">
              <h2 className="font-medium lg:text-[20px]">Sub-district</h2>
              <input
                type="text"
                name="SubDistrict"
                className="rounded-[10px] border border-[#00000040] bg-[#FAFAFA] text-[#2B5991] lg:h-[50px] lg:w-[226px] lg:gap-[10px] lg:px-[16px] lg:py-[13px] lg:text-[16px]"
                value={data.SubDistrict}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col lg:gap-[13px]">
              <h2 className="font-medium lg:text-[20px]">District</h2>
              <input
                type="text"
                name="District"
                className="rounded-[10px] border border-[#00000040] bg-[#FAFAFA] text-[#2B5991] lg:h-[50px] lg:w-[226px] lg:gap-[10px] lg:px-[16px] lg:py-[13px] lg:text-[16px]"
                value={data.District}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="flex lg:gap-[27px]">
            <div className="flex flex-col lg:gap-[13px]">
              <h2 className="font-medium lg:text-[20px]">Province</h2>
              <input
                type="text"
                name="Province"
                className="rounded-[10px] border border-[#00000040] bg-[#FAFAFA] text-[#2B5991] lg:h-[50px] lg:w-[226px] lg:gap-[10px] lg:px-[16px] lg:py-[13px] lg:text-[16px]"
                value={data.Province}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col lg:gap-[13px]">
              <h2 className="font-medium lg:text-[20px]">Postal Code</h2>
              <input
                type="text"
                name="PostalCode"
                className="rounded-[10px] border border-[#00000040] bg-[#FAFAFA] text-[#2B5991] lg:h-[50px] lg:w-[226px] lg:gap-[10px] lg:px-[16px] lg:py-[13px] lg:text-[16px]"
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
