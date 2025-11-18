import { useState } from 'react';

interface ChangePasswordModalProps {
  onClose: () => void;
}

const handleSubmit = () => {};

function ChangePasswordModal({ onClose }: ChangePasswordModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative flex flex-col rounded-[10px] bg-white shadow-lg lg:h-[596px] lg:w-[506px] lg:gap-[30px] lg:p-8">
        <button
          onClick={onClose}
          className="absolute cursor-pointer text-gray-500 hover:text-gray-700 lg:top-3 lg:right-3 lg:text-[20px]"
        >
          ✕
        </button>
        <h1 className="text-center font-semibold lg:text-[32px]">
          Update your password
        </h1>
        <div className="flex flex-col items-center lg:gap-[30px]">
          <div className="flex flex-col items-start lg:gap-[13px]">
            <h2 className="font-medium lg:text-[20px]">Current Password</h2>
            <input
              type="password"
              name="currentPassword"
              className="rounded-[10px] border border-[#00000040] bg-[#FAFAFA] text-[#2B5991] lg:h-[50px] lg:w-[332px] lg:gap-[10px] lg:px-[16px] lg:py-[13px] lg:text-[16px]"
            />
          </div>
          <div className="flex flex-col items-start lg:gap-[13px]">
            <h2 className="font-medium lg:text-[20px]">New Password</h2>
            <input
              type="password"
              name="newPassword"
              className="rounded-[10px] border border-[#00000040] bg-[#FAFAFA] text-[#2B5991] lg:h-[50px] lg:w-[332px] lg:gap-[10px] lg:px-[16px] lg:py-[13px] lg:text-[16px]"
            />
          </div>
          <div className="flex flex-col items-start lg:gap-[13px]">
            <h2 className="font-medium lg:text-[20px]">Confirm New Password</h2>
            <input
              type="password"
              name="confirmPassword"
              className="rounded-[10px] border border-[#00000040] bg-[#FAFAFA] text-[#2B5991] lg:h-[50px] lg:w-[332px] lg:gap-[10px] lg:px-[16px] lg:py-[13px] lg:text-[16px]"
            />
          </div>
          <div className="flex justify-end lg:w-[332px]">
            <button
              onClick={handleSubmit}
              className="items-center rounded-[10px] bg-[#01CCFF] text-[#FFFFFF] lg:h-[45px] lg:w-[105px]"
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
