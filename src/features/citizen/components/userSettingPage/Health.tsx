import { CitizenSetting } from '../../types';
import BloodTypeDropdown from './BloodTypeDropDown';
import GenderDropdown from './GenderDropDown';
import { z } from 'zod';
import { useState, useEffect } from 'react';

interface HealthPropsWithSetter extends CitizenSetting.HeathProps {
  onDataChange: (newData: any) => void;
  onValidationChange?: (errors: Record<string, string>) => void;
}

const healthSchema = z.object({
  BirthDate: z
    .string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 0 && age <= 150;
    }, 'Please enter a valid date of birth'),
  BloodType: z.enum(['A', 'B', 'AB', 'O', 'none'], {
    errorMap: () => ({ message: 'Please select a valid blood type' }),
  }),
  CongenitalDisease: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  Allergic: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  Height: z
    .union([z.string(), z.number()])
    .optional()
    .refine((val) => {
      if (!val || val === '' || val === 0) return true;
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return !isNaN(num) && num >= 50 && num <= 300;
    }, 'Height must be between 50 and 300 cm'),
  Weight: z
    .union([z.string(), z.number()])
    .optional()
    .refine((val) => {
      if (!val || val === '' || val === 0) return true;
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return !isNaN(num) && num >= 2 && num <= 500;
    }, 'Weight must be between 2 and 500 kg'),
  Gender: z.enum(['male', 'female', 'none'], {
    errorMap: () => ({ message: 'Please select a valid gender' }),
  }),
});

function Health({
  data,
  onDataChange,
  onValidationChange,
}: HealthPropsWithSetter) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Notify parent component when errors change
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(errors);
    }
  }, [errors, onValidationChange]);

  const validateField = (name: string, value: any) => {
    const result = healthSchema
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (['Height', 'Weight'].includes(name)) {
      const numericValue = value.replace(/[^0-9.]/g, '');
      const parts = numericValue.split('.');
      const cleanValue =
        parts.length > 2
          ? parts[0] + '.' + parts.slice(1).join('')
          : numericValue;
      onDataChange({
        ...data,
        [name]: cleanValue,
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

  return (
    <div className="flex w-full flex-col gap-4 md:gap-5">
      {/* Basic Health Info Section */}
      <div className="flex flex-col gap-3 rounded-xl border border-gray-100 p-4 shadow-lg md:p-5">
        <h1 className="text-base font-bold text-blue-900 md:text-lg">
          Basic Health Information
        </h1>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <h2 className={labelClass}>Date of Birth</h2>
            <input
              type="date"
              name="BirthDate"
              className={inputClass('BirthDate')}
              value={data.BirthDate}
              onChange={handleChange}
              onBlur={handleBlur}
              max={new Date().toISOString().split('T')[0]}
            />
            {errors.BirthDate && (
              <p className={errorClass}>{errors.BirthDate}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <h2 className={labelClass}>Blood Type</h2>
            <BloodTypeDropdown
              value={data.BloodType}
              onChange={(newValue) => {
                onDataChange({ ...data, BloodType: newValue });
              }}
            />
            {errors.BloodType && (
              <p className={errorClass}>{errors.BloodType}</p>
            )}
          </div>
        </div>
      </div>

      {/* Medical Conditions Section */}
      <div className="flex flex-col gap-3 rounded-xl border border-gray-100 p-4 shadow-lg md:p-5">
        <h1 className="text-base font-bold text-blue-900 md:text-lg">
          Medical Conditions
        </h1>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <h2 className={labelClass}>Congenital Disease</h2>
            <input
              type="text"
              name="CongenitalDisease"
              className={inputClass('CongenitalDisease')}
              value={data.CongenitalDisease}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter any congenital diseases (optional)"
            />
            {errors.CongenitalDisease && (
              <p className={errorClass}>{errors.CongenitalDisease}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <h2 className={labelClass}>Allergies</h2>
            <input
              type="text"
              name="Allergic"
              className={inputClass('Allergic')}
              value={data.Allergic}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter any allergies (optional)"
            />
            {errors.Allergic && <p className={errorClass}>{errors.Allergic}</p>}
          </div>
        </div>
      </div>

      {/* Insurance Section */}
      <div className="flex flex-col gap-3 rounded-xl border border-gray-100 p-4 shadow-lg md:p-5">
        <h1 className="text-base font-bold text-blue-900 md:text-lg">
          Insurance Information
        </h1>
        <div className="flex flex-col gap-1.5">
          <h2 className={labelClass}>Insurance Number</h2>
          <div className={disabledInputClass}>
            {data.Insurance || 'No insurance number'}
          </div>
        </div>
      </div>

      {/* Physical Measurements Section */}
      <div className="flex flex-col gap-3 rounded-xl border border-gray-100 p-4 shadow-lg md:p-5">
        <h1 className="text-base font-bold text-blue-900 md:text-lg">
          Physical Measurements
        </h1>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <h2 className={labelClass}>Height (cm)</h2>
            <input
              type="text"
              name="Height"
              className={inputClass('Height')}
              value={data.Height}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter height"
            />
            {errors.Height && <p className={errorClass}>{errors.Height}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <h2 className={labelClass}>Weight (kg)</h2>
            <input
              type="text"
              name="Weight"
              className={inputClass('Weight')}
              value={data.Weight}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter weight"
            />
            {errors.Weight && <p className={errorClass}>{errors.Weight}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <h2 className={labelClass}>Gender</h2>
            <GenderDropdown
              value={data.Gender}
              onChange={(newValue) => {
                onDataChange({ ...data, Gender: newValue });
              }}
            />
            {errors.Gender && <p className={errorClass}>{errors.Gender}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Health;
