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
    <div className="flex flex-col gap-[27px]">
      <div className="flex gap-[27px]">
        <div className="flex flex-col gap-[13px]">
          <h2 className="text-[20px] font-medium">Username</h2>
          <input
            type="text"
            name="Username"
            className="h-[50px] w-[289px] gap-[10px] rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-[16px] py-[13px] text-[16px] text-[#2B5991]"
            value={data.Username}
            onChange={handleChange}
          />
        </div>

        <div className="flex flex-col gap-[13px]">
          <h2 className="text-[20px] font-medium">Email</h2>
          <input
            type="text"
            name="Email"
            className="h-[50px] w-[320px] gap-[10px] rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-[16px] py-[13px] text-[16px] text-[#2B5991]"
            value={data.Email}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="flex flex-col gap-[13px]">
        <h2 className="text-[20px] font-medium">Password</h2>
        <div
          className="flex h-[66px] w-[345px] cursor-pointer items-center justify-center rounded-[10px] bg-[#01CEF8]"
          onClick={changePasswordModal}
        >
          <h3 className="inline h-fit text-[16px] font-semibold text-[#FFFFFF]">
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
