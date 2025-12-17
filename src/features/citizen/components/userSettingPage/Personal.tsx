import { CitizenSetting } from '../../types';
import { z } from 'zod';
import { useState, useEffect } from 'react';

interface PersonalPropsWithSetter extends CitizenSetting.PersonalProps {
  specialists?: any[];
  onDataChange: (newData: any) => void;
  onValidationChange?: (errors: Record<string, string>) => void;
}

const personalSchema = z.object({
  IdCardNumber: z
    .string()
    .length(13, 'ID card number must be exactly 13 digits')
    .regex(/^\d+$/, 'ID card number must contain only numbers')
    .or(z.string().length(0)),
  Firstname: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters'),
  Middlename: z
    .string()
    .max(50, 'Middle name must be less than 50 characters')
    .optional(),
  Lastname: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters'),
  Enthnicity: z
    .string()
    .max(50, 'Ethnicity must be less than 50 characters')
    .optional(),
  Nationality: z
    .string()
    .max(50, 'Nationality must be less than 50 characters')
    .optional(),
  Religion: z
    .string()
    .max(50, 'Religion must be less than 50 characters')
    .optional(),
  PhoneNumber: z
    .string()
    .regex(
      /^[0-9]{10}$|^[0-9]{3}-[0-9]{3}-[0-9]{4}$|^$/,
      'Phone number must be in format: 0812345678 or 081-234-5678'
    ),
  AddressLine: z
    .string()
    .min(1, 'Address is required')
    .max(200, 'Address must be less than 200 characters'),
  SubDistrict: z
    .string()
    .min(1, 'Sub-district is required')
    .max(100, 'Sub-district must be less than 100 characters'),
  District: z
    .string()
    .min(1, 'District is required')
    .max(100, 'District must be less than 100 characters'),
  Province: z
    .string()
    .min(1, 'Province is required')
    .max(100, 'Province must be less than 100 characters'),
  PostalCode: z
    .string()
    .length(5, 'Postal code must be exactly 5 digits')
    .regex(/^\d+$/, 'Postal code must contain only numbers')
    .or(z.string().length(0)),
});

function Personal({
  data,
  specialists = [],
  onDataChange,
  onValidationChange,
}: PersonalPropsWithSetter) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (name: string, value: string) => {
    const result = personalSchema
      .pick({ [name]: true })
      .safeParse({ [name]: value });

    if (result.success) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    } else {
      const message = result.error.errors?.[0]?.message ?? 'Invalid value';
      setErrors((prev) => ({
        ...prev,
        [name]: message,
      }));
    }
  };

  const noNumberFields = [
    'Firstname',
    'Middlename',
    'Lastname',
    'SubDistrict',
    'District',
    'Province',
    'Enthnicity',
    'Nationality',
    'Religion',
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (['IdCardNumber', 'PostalCode', 'PhoneNumber'].includes(name)) {
      const numericValue = value.replace(/[^0-9-]/g, '');
      onDataChange({
        ...data,
        [name]: numericValue,
      });
      return;
    }

    if (noNumberFields.includes(name)) {
      const textOnlyValue = value.replace(/[0-9]/g, '');
      onDataChange({
        ...data,
        [name]: textOnlyValue,
      });
      return;
    }

    onDataChange({
      ...data,
      [name]: value,
    });
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const inputClass = (fieldName: string) =>
    `w-full rounded-lg border ${errors[fieldName] ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'} text-gray-900 px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 ${errors[fieldName] ? 'focus:ring-red-400' : 'focus:ring-cyan-400'} focus:border-transparent hover:border-gray-300`;

  const labelClass = 'font-medium text-gray-700 text-xs md:text-sm';
  const disabledInputClass =
    'w-full rounded-lg border border-gray-100 bg-gray-50 text-gray-500 px-3 py-2 text-sm cursor-not-allowed';
  const errorClass = 'text-xs text-red-500 mt-1';

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
            className={inputClass('IdCardNumber')}
            value={data.IdCardNumber}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter 13-digit ID number"
            maxLength={13}
          />
          {errors.IdCardNumber && (
            <p className={errorClass}>{errors.IdCardNumber}</p>
          )}
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
            className={inputClass('Firstname')}
            value={data.Firstname}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter first name"
          />
          {errors.Firstname && <p className={errorClass}>{errors.Firstname}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <h2 className={labelClass}>Middle Name</h2>
          <input
            type="text"
            name="Middlename"
            className={inputClass('Middlename')}
            value={data.Middlename}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Optional"
          />
          {errors.Middlename && (
            <p className={errorClass}>{errors.Middlename}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <h2 className={labelClass}>Last Name</h2>
          <input
            type="text"
            name="Lastname"
            className={inputClass('Lastname')}
            value={data.Lastname}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter last name"
          />
          {errors.Lastname && <p className={errorClass}>{errors.Lastname}</p>}
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
              className={inputClass('Enthnicity')}
              value={data.Enthnicity}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter ethnicity"
            />
            {errors.Enthnicity && (
              <p className={errorClass}>{errors.Enthnicity}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <h2 className={labelClass}>Nationality</h2>
            <input
              type="text"
              name="Nationality"
              className={inputClass('Nationality')}
              value={data.Nationality}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter nationality"
            />
            {errors.Nationality && (
              <p className={errorClass}>{errors.Nationality}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <h2 className={labelClass}>Religion</h2>
            <input
              type="text"
              name="Religion"
              className={inputClass('Religion')}
              value={data.Religion}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter religion"
            />
            {errors.Religion && <p className={errorClass}>{errors.Religion}</p>}
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
              className={inputClass('PhoneNumber')}
              value={data.PhoneNumber}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="0812345678 or 081-234-5678"
              maxLength={12}
            />
            {errors.PhoneNumber && (
              <p className={errorClass}>{errors.PhoneNumber}</p>
            )}
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
              className={inputClass('AddressLine')}
              value={data.AddressLine}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your address"
            />
            {errors.AddressLine && (
              <p className={errorClass}>{errors.AddressLine}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <h2 className={labelClass}>Sub-district</h2>
              <input
                type="text"
                name="SubDistrict"
                className={inputClass('SubDistrict')}
                value={data.SubDistrict}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter sub-district"
              />
              {errors.SubDistrict && (
                <p className={errorClass}>{errors.SubDistrict}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <h2 className={labelClass}>District</h2>
              <input
                type="text"
                name="District"
                className={inputClass('District')}
                value={data.District}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter district"
              />
              {errors.District && (
                <p className={errorClass}>{errors.District}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <h2 className={labelClass}>Province</h2>
              <input
                type="text"
                name="Province"
                className={inputClass('Province')}
                value={data.Province}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter province"
              />
              {errors.Province && (
                <p className={errorClass}>{errors.Province}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <h2 className={labelClass}>Postal Code</h2>
              <input
                type="text"
                name="PostalCode"
                className={inputClass('PostalCode')}
                value={data.PostalCode}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter 5-digit postal code"
                maxLength={5}
              />
              {errors.PostalCode && (
                <p className={errorClass}>{errors.PostalCode}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Personal;
