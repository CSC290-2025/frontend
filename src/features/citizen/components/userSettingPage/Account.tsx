import { CitizenSetting } from '../../types';
import ChangePasswordModal from './ChangePasswordModal';
import { useState } from 'react';

interface AccountPropsWithSetter extends CitizenSetting.AccountProps {
  onDataChange: (newData: any) => void;
}

function Account({ data, onDataChange }: AccountPropsWithSetter) {
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

  return (
    <div className="flex flex-col gap-5 md:gap-6 lg:gap-[27px]">
      <div className="flex flex-col gap-4 md:flex-row md:gap-5 lg:gap-[27px]">
        <div className="flex flex-col gap-2 md:gap-3 lg:gap-[13px]">
          <h2 className="text-base font-medium md:text-lg lg:text-[20px]">
            Username
          </h2>
          <input
            type="text"
            name="Username"
            className="h-12 w-full rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-4 py-3 text-sm text-[#2B5991] md:h-[50px] md:w-[289px] md:text-base lg:h-[50px] lg:w-[289px] lg:gap-[10px] lg:px-[16px] lg:py-[13px] lg:text-[16px]"
            value={data.Username}
            onChange={handleChange}
          />
        </div>

        <div className="flex flex-col gap-2 md:gap-3 lg:gap-[13px]">
          <h2 className="text-base font-medium md:text-lg lg:text-[20px]">
            Email
          </h2>
          <input
            type="text"
            name="Email"
            className="h-12 w-full rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-4 py-3 text-sm text-[#2B5991] md:h-[50px] md:w-[320px] md:text-base lg:h-[50px] lg:w-[320px] lg:gap-[10px] lg:px-[16px] lg:py-[13px] lg:text-[16px]"
            value={data.Email}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 md:gap-3 lg:gap-[13px]">
        <h2 className="text-base font-medium md:text-lg lg:text-[20px]">
          Password
        </h2>
        <div
          className="flex h-14 w-full cursor-pointer items-center justify-center rounded-[10px] bg-[#01CEF8] md:h-[66px] md:w-[345px] lg:h-[66px] lg:w-[345px]"
          onClick={changePasswordModal}
        >
          <h3 className="inline h-fit text-sm font-semibold text-[#FFFFFF] md:text-base lg:text-[16px]">
            Change Password
          </h3>
        </div>
      </div>
      {isModalOpen && (
        <ChangePasswordModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}

export default Account;
