import { CitizenSetting } from '../../types';
import { useState } from 'react';

interface AccountPropsWithSetter extends CitizenSetting.AccountProps {
  onDataChange: (newData: any) => void;
  roles?: Array<{ id: number; role_name: string }>;
}

function Account({ data, onDataChange, roles = [] }: AccountPropsWithSetter) {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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
              className={inputClass}
              value={data.Username}
              onChange={handleChange}
              placeholder="Enter username"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <h2 className={labelClass}>Email</h2>
            <input
              type="text"
              name="Email"
              className={inputClass}
              value={data.Email}
              onChange={handleChange}
              placeholder="Enter email address"
            />
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
