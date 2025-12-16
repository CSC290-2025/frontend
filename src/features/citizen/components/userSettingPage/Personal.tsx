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
    'w-full rounded-lg border border-gray-200 bg-white text-gray-900 px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent hover:border-gray-300';
  const labelClass = 'font-medium text-gray-700 text-xs md:text-sm';
  const disabledInputClass =
    'w-full rounded-lg border border-gray-100 bg-gray-50 text-gray-500 px-3 py-2 text-sm cursor-not-allowed';

  const specialistNames =
    specialists
      .map((s) => s?.specialty_name || '')
      .filter(Boolean)
      .join(', ') || 'No specialist assigned';

  return (
    <div className="flex w-full flex-col gap-4 md:gap-5">
      {/* ID card number and Specialist */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <h2 className={labelClass}>ID Card Number</h2>
          <input
            type="text"
            name="IdCardNumber"
            className={inputClass}
            value={data.IdCardNumber}
            onChange={handleChange}
            placeholder="Enter your ID card number"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <h2 className={labelClass}>Specialist</h2>
          <div className={disabledInputClass}>{specialistNames}</div>
        </div>
      </div>

      {/* Full Name */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <h2 className={labelClass}>First Name</h2>
          <input
            type="text"
            name="Firstname"
            className={inputClass}
            value={data.Firstname}
            onChange={handleChange}
            placeholder="Enter first name"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <h2 className={labelClass}>Middle Name</h2>
          <input
            type="text"
            name="Middlename"
            className={inputClass}
            value={data.Middlename}
            onChange={handleChange}
            placeholder="Optional"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <h2 className={labelClass}>Last Name</h2>
          <input
            type="text"
            name="Lastname"
            className={inputClass}
            value={data.Lastname}
            onChange={handleChange}
            placeholder="Enter last name"
          />
        </div>
      </div>

      {/* Demographic Section */}
      <div className="flex flex-col gap-3 rounded-xl border border-gray-100 p-4 shadow-lg md:p-5">
        <h1 className="text-base font-bold text-blue-900 md:text-lg">
          Demographic Information
        </h1>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <h2 className={labelClass}>Ethnicity</h2>
            <input
              type="text"
              name="Enthnicity"
              className={inputClass}
              value={data.Enthnicity}
              onChange={handleChange}
              placeholder="Enter ethnicity"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <h2 className={labelClass}>Nationality</h2>
            <input
              type="text"
              name="Nationality"
              className={inputClass}
              value={data.Nationality}
              onChange={handleChange}
              placeholder="Enter nationality"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <h2 className={labelClass}>Religion</h2>
            <input
              type="text"
              name="Religion"
              className={inputClass}
              value={data.Religion}
              onChange={handleChange}
              placeholder="Enter religion"
            />
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="flex flex-col gap-3 rounded-xl border border-gray-100 p-4 shadow-lg md:p-5">
        <h1 className="text-base font-bold text-blue-900 md:text-lg">
          Contact Information
        </h1>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <h2 className={labelClass}>Phone Number</h2>
            <input
              type="text"
              name="PhoneNumber"
              className={inputClass}
              value={data.PhoneNumber}
              onChange={handleChange}
              placeholder="Enter phone number"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <h2 className={labelClass}>Emergency Contact</h2>
            <input
              type="text"
              disabled
              className={disabledInputClass}
              value={data.EmergencyContact || 'No emergency contact set'}
            />
          </div>
        </div>
      </div>

      {/* Address Section */}
      <div className="flex flex-col gap-3 rounded-xl border border-gray-100 p-4 shadow-lg md:p-5">
        <h1 className="text-base font-bold text-blue-900 md:text-lg">
          Address
        </h1>
        <div className="flex flex-col gap-4">
          <div className="flex w-full flex-col gap-1.5">
            <h2 className={labelClass}>Address Line</h2>
            <input
              type="text"
              name="AddressLine"
              className={inputClass}
              value={data.AddressLine}
              onChange={handleChange}
              placeholder="Enter your address"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <h2 className={labelClass}>Sub-district</h2>
              <input
                type="text"
                name="SubDistrict"
                className={inputClass}
                value={data.SubDistrict}
                onChange={handleChange}
                placeholder="Enter sub-district"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <h2 className={labelClass}>District</h2>
              <input
                type="text"
                name="District"
                className={inputClass}
                value={data.District}
                onChange={handleChange}
                placeholder="Enter district"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <h2 className={labelClass}>Province</h2>
              <input
                type="text"
                name="Province"
                className={inputClass}
                value={data.Province}
                onChange={handleChange}
                placeholder="Enter province"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <h2 className={labelClass}>Postal Code</h2>
              <input
                type="text"
                name="PostalCode"
                className={inputClass}
                value={data.PostalCode}
                onChange={handleChange}
                placeholder="Enter postal code"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Personal;
