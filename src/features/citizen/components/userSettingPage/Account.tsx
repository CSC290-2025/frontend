import { CitizenSetting } from '../../types';
import { z } from 'zod';
import { useState, useEffect } from 'react';

interface AccountPropsWithSetter extends CitizenSetting.AccountProps {
  onDataChange: (newData: any) => void;
  onValidationChange?: (errors: Record<string, string>) => void;
  roles?: Array<{ id: number; role_name: string }>;
}

const accountSchema = z.object({
  Username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters'),
  Email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters'),
});

function Account({
  data,
  onDataChange,
  onValidationChange,
  roles = [],
}: AccountPropsWithSetter) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Notify parent component when errors change
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(errors);
    }
  }, [errors, onValidationChange]);

  const validateField = (name: string, value: string) => {
    const result = accountSchema
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
      {/* Account Credentials Section */}
      <div className="flex flex-col gap-3 rounded-xl border border-gray-100 p-4 shadow-lg md:p-5">
        <h1 className="text-base font-bold text-blue-900 md:text-lg">
          Account Credentials
        </h1>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <h2 className={labelClass}>Username</h2>
            <input
              type="text"
              name="Username"
              className={inputClass('Username')}
              value={data.Username}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter username"
              maxLength={30}
            />
            {errors.Username && <p className={errorClass}>{errors.Username}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <h2 className={labelClass}>Email</h2>
            <input
              type="email"
              name="Email"
              className={inputClass('Email')}
              value={data.Email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter email address"
              maxLength={100}
            />
            {errors.Email && <p className={errorClass}>{errors.Email}</p>}
          </div>
        </div>
      </div>

      {/* Role Section */}
      <div className="flex flex-col gap-3 rounded-xl border border-gray-100 p-4 shadow-lg md:p-5">
        <h1 className="text-base font-bold text-blue-900 md:text-lg">
          User Role
        </h1>
        <div className="flex flex-col gap-1.5">
          <h2 className={labelClass}>Assigned Role</h2>
          <div className={disabledInputClass}>
            {roles && roles.length > 0 ? (
              roles.map((role, index) => (
                <span key={role.id}>
                  {role.role_name}
                  {index < roles.length - 1 && ', '}
                </span>
              ))
            ) : (
              <span className="text-gray-400">No role assigned</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Account;
