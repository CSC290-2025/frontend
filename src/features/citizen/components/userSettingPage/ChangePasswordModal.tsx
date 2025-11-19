import { useState } from 'react';

interface ChangePasswordModalProps {
  onClose: () => void;
}

const handleSubmit = () => {};

function ChangePasswordModal({ onClose }: ChangePasswordModalProps) {
  const inputClass =
    'h-12 w-full rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-4 py-3 text-sm text-[#2B5991] md:h-[50px] md:text-base lg:h-[50px] lg:px-[16px] lg:py-[13px] lg:text-[16px]';
  const labelClass = 'text-base font-medium md:text-lg lg:text-[20px]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative flex w-full max-w-[90%] flex-col gap-6 rounded-[10px] bg-white p-6 shadow-lg md:max-w-[506px] md:gap-[30px] md:p-8 lg:h-auto lg:w-[506px]">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 cursor-pointer text-xl text-gray-500 hover:text-gray-700 md:top-3 md:right-3 md:text-2xl lg:top-3 lg:right-3 lg:text-[20px]"
        >
          ✕
        </button>

        <h1 className="text-center text-2xl font-semibold md:text-3xl lg:text-[32px]">
          Update your password
        </h1>

        <div className="flex w-full flex-col items-center gap-5 md:gap-6 lg:gap-[30px]">
          <div className="flex w-full flex-col items-start gap-2 md:gap-3 lg:gap-[13px]">
            <h2 className={labelClass}>Current Password</h2>
            <input
              type="password"
              name="currentPassword"
              className={inputClass}
            />
          </div>

          <div className="flex w-full flex-col items-start gap-2 md:gap-3 lg:gap-[13px]">
            <h2 className={labelClass}>New Password</h2>
            <input type="password" name="newPassword" className={inputClass} />
          </div>

          <div className="flex w-full flex-col items-start gap-2 md:gap-3 lg:gap-[13px]">
            <h2 className={labelClass}>Confirm New Password</h2>
            <input
              type="password"
              name="confirmPassword"
              className={inputClass}
            />
          </div>

          <div className="flex w-full justify-end">
            <button
              onClick={handleSubmit}
              className="h-11 w-24 items-center rounded-[10px] bg-[#01CCFF] text-sm text-[#FFFFFF] md:h-[45px] md:w-[105px] md:text-base"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChangePasswordModal;
