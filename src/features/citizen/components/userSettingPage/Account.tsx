import { CitizenSetting } from '../../types';
import ChangePasswordModal from './ChangePasswordModal';
import { useState } from 'react';

interface AccountPropsWithSetter extends CitizenSetting.AccountProps {
  onDataChange: (newData: any) => void;
  roles?: Array<{ id: number; role_name: string }>;
}

function Account({ data, onDataChange, roles = [] }: AccountPropsWithSetter) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    onDataChange({
      ...data,
      [name]: value,
    });
  };

  const changePasswordModal = () => {
    setIsModalOpen(true);
  };

  const inputClass =
    'h-12 w-full rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-4 py-3 text-sm text-[#2B5991] md:h-[50px] md:text-base lg:h-[50px] lg:px-[16px] lg:py-[13px] lg:text-[16px]';

  const labelClass = 'text-base font-medium md:text-lg lg:text-[20px]';

  return (
    <div className="flex w-full flex-col gap-5 md:gap-6 lg:gap-[27px]">
      {/* Username & Email Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:gap-[27px]">
        <div className="flex flex-col gap-2 md:gap-3 lg:gap-[13px]">
          <h2 className={labelClass}>Username</h2>
          <input
            type="text"
            name="Username"
            className={inputClass}
            value={data.Username}
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col gap-2 md:gap-3 lg:gap-[13px]">
          <h2 className={labelClass}>Email</h2>
          <input
            type="text"
            name="Email"
            className={inputClass}
            value={data.Email}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Role Section */}
      <div className="flex flex-col gap-2 md:gap-3 lg:gap-[13px]">
        <h2 className={labelClass}>Role</h2>
        <div className={inputClass}>
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

      {/* Password Section */}
      <div className="flex flex-col gap-2 md:gap-3 lg:gap-[13px]">
        <h2 className={labelClass}>Password</h2>
        <div className="flex justify-start">
          <div
            className="flex h-14 w-full cursor-pointer items-center justify-center rounded-[10px] bg-[#01CEF8] px-6 md:h-[66px] md:w-auto md:min-w-[345px]"
            onClick={changePasswordModal}
          >
            <h3 className="inline h-fit text-sm font-semibold text-[#FFFFFF] md:text-base lg:text-[16px]">
              Change Password
            </h3>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <ChangePasswordModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}

export default Account;
