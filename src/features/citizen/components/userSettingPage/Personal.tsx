import { CitizenSetting } from '../../types';

interface PersonalPropsWithSetter extends CitizenSetting.PersonalProps {
  specialists?: any[];
  onDataChange: (newData: any) => void;
}

function Personal({
  data,
  specialists = [],
  onDataChange,
}: PersonalPropsWithSetter) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onDataChange({
      ...data,
      [name]: value,
    });
  };

  const inputClass =
    'w-full rounded-[10px] border border-[#00000040] bg-[#FAFAFA] text-[#2B5991] px-4 py-3 text-sm md:text-base lg:text-[16px] lg:px-[16px] lg:py-[13px] focus:outline-none focus:ring-2 focus:ring-blue-400';
  const labelClass = 'font-medium text-base md:text-lg lg:text-[20px]';

  // Get specialist names from the array
  const specialistNames =
    specialists
      .map((s) => s?.specialty_name || '')
      .filter(Boolean)
      .join(', ') || 'No specialist assigned';

  return (
    <div className="flex w-full flex-col gap-5 md:gap-6 lg:gap-[27px]">
      {/* ID card number and Specialist */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:gap-[27px]">
        <div className="flex flex-col gap-2 md:gap-3 lg:gap-[13px]">
          <h2 className={labelClass}>ID card Number</h2>
          <input
            type="text"
            name="IdCardNumber"
            className={inputClass}
            value={data.IdCardNumber}
            onChange={handleChange}
          />
        </div>

        <div className="flex flex-col gap-2 md:gap-3 lg:gap-[13px]">
          <h2 className={labelClass}>Specialist</h2>
          <div
            className={`${inputClass} cursor-not-allowed bg-gray-100 text-gray-600`}
          >
            {specialistNames}
          </div>
        </div>
      </div>

      {/* Full Name */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5 lg:gap-[27px]">
        <div className="flex flex-col gap-2 md:gap-3 lg:gap-[13px]">
          <h2 className={labelClass}>First name</h2>
          <input
            type="text"
            name="Firstname"
            className={inputClass}
            value={data.Firstname}
            onChange={handleChange}
          />
        </div>

        <div className="flex flex-col gap-2 md:gap-3 lg:gap-[13px]">
          <h2 className={labelClass}>Middle name</h2>
          <input
            type="text"
            name="Middlename"
            className={inputClass}
            value={data.Middlename}
            onChange={handleChange}
          />
        </div>

        <div className="flex flex-col gap-2 md:gap-3 lg:gap-[13px]">
          <h2 className={labelClass}>Last name</h2>
          <input
            type="text"
            name="Lastname"
            className={inputClass}
            value={data.Lastname}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Demographic Section */}
      <div className="flex flex-col gap-4 md:gap-5 lg:gap-[27px]">
        <h1 className="text-lg font-semibold text-[#2B5991] md:text-xl lg:text-[24px]">
          Demographic
        </h1>
        {/* Indented container using Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5 md:pl-[49px] lg:gap-[27px]">
          <div className="flex flex-col gap-2 md:gap-3 lg:gap-[13px]">
            <h2 className={labelClass}>Ethnicity</h2>
            <input
              type="text"
              name="Enthnicity"
              className={inputClass}
              value={data.Enthnicity}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col gap-2 md:gap-3 lg:gap-[13px]">
            <h2 className={labelClass}>Nationality</h2>
            <input
              type="text"
              name="Nationality"
              className={inputClass}
              value={data.Nationality}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col gap-2 md:gap-3 lg:gap-[13px]">
            <h2 className={labelClass}>Religion</h2>
            <input
              type="text"
              name="Religion"
              className={inputClass}
              value={data.Religion}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="flex flex-col gap-4 md:gap-5 lg:gap-[27px]">
        <h1 className="text-lg font-semibold text-[#2B5991] md:text-xl lg:text-[24px]">
          Contact
        </h1>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 md:pl-[49px] lg:gap-[27px]">
          <div className="flex flex-col gap-2 md:gap-3 lg:gap-[13px]">
            <h2 className={labelClass}>Phone number</h2>
            <input
              type="text"
              name="PhoneNumber"
              className={inputClass}
              value={data.PhoneNumber}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col gap-2 md:gap-3 lg:gap-[13px]">
            <h2 className={labelClass}>Emergency contact</h2>
            {/* CHANGED: From div to input, added disabled, added value prop */}
            <input
              type="text"
              disabled
              className={`${inputClass} cursor-not-allowed bg-gray-100 text-gray-600`}
              value={data.EmergencyContact || ''}
            />
          </div>
        </div>
      </div>

      {/* Address Section */}
      <div className="flex flex-col gap-4 md:gap-5 lg:gap-[27px]">
        <h1 className="text-lg font-semibold text-[#2B5991] md:text-xl lg:text-[24px]">
          Address
        </h1>
        <div className="flex flex-col gap-4 md:gap-5 md:pl-[49px] lg:gap-[27px]">
          {/* Full width Address Line */}
          <div className="flex w-full flex-col gap-2 md:gap-3 lg:gap-[13px]">
            <h2 className={labelClass}>Address line</h2>
            <input
              type="text"
              name="AddressLine"
              className={inputClass}
              value={data.AddressLine}
              onChange={handleChange}
            />
          </div>

          {/* Sub-district & District (2 cols) */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:gap-[27px]">
            <div className="flex flex-col gap-2 md:gap-3 lg:gap-[13px]">
              <h2 className={labelClass}>Sub-district</h2>
              <input
                type="text"
                name="SubDistrict"
                className={inputClass}
                value={data.SubDistrict}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col gap-2 md:gap-3 lg:gap-[13px]">
              <h2 className={labelClass}>District</h2>
              <input
                type="text"
                name="District"
                className={inputClass}
                value={data.District}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Province & Postal Code (2 cols) */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:gap-[27px]">
            <div className="flex flex-col gap-2 md:gap-3 lg:gap-[13px]">
              <h2 className={labelClass}>Province</h2>
              <input
                type="text"
                name="Province"
                className={inputClass}
                value={data.Province}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col gap-2 md:gap-3 lg:gap-[13px]">
              <h2 className={labelClass}>Postal Code</h2>
              <input
                type="text"
                name="PostalCode"
                className={inputClass}
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
