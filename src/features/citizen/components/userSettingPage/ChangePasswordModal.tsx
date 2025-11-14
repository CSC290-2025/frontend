import { useState } from 'react';

interface ChangePasswordModalProps {
  onClose: () => void;
}

const handleSubmit = () => {};

function ChangePasswordModal({ onClose }: ChangePasswordModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative flex h-[596px] w-[506px] flex-col gap-[30px] rounded-[10px] bg-white p-8 shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 cursor-pointer text-[20px] text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        <h1 className="text-center text-[32px] font-semibold">
          Update your password
        </h1>
        <div className="flex flex-col items-center gap-[30px]">
          <div className="flex flex-col items-start gap-[13px]">
            <h2 className="text-[20px] font-medium">Current Password</h2>
            <input
              type="password"
              name="currentPassword"
              className="h-[50px] w-[332px] gap-[10px] rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-[16px] py-[13px] text-[16px] text-[#2B5991]"
            />
          </div>
          <div className="flex flex-col items-start gap-[13px]">
            <h2 className="text-[20px] font-medium">New Password</h2>
            <input
              type="password"
              name="newPassword"
              className="h-[50px] w-[332px] gap-[10px] rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-[16px] py-[13px] text-[16px] text-[#2B5991]"
            />
          </div>
          <div className="flex flex-col items-start gap-[13px]">
            <h2 className="text-[20px] font-medium">Confirm New Password</h2>
            <input
              type="password"
              name="confirmPassword"
              className="h-[50px] w-[332px] gap-[10px] rounded-[10px] border border-[#00000040] bg-[#FAFAFA] px-[16px] py-[13px] text-[16px] text-[#2B5991]"
            />
          </div>
          <div className="flex w-[332px] justify-end">
            <button
              onClick={handleSubmit}
              className="h-[45px] w-[105px] items-center rounded-[10px] bg-[#01CCFF] text-[#FFFFFF]"
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
