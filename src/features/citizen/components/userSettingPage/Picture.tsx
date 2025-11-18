import { useRef, useState } from 'react';

interface PhotoProps {
  username: string;
  picture: string;
}

function Picture({ username, picture }: PhotoProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(picture || null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewUrl(imageUrl);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center lg:h-[281px] lg:w-[295px] lg:gap-[22px]">
      <div className="flex items-center justify-center overflow-hidden rounded-[10px] border bg-gray-50 lg:h-[146px] lg:w-[146px]">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Preview"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-sm text-gray-400">No image</span>
        )}
      </div>

      <h1 className="font-semibold text-[#2B5991] lg:text-[32px]">
        {username}
      </h1>
      <button
        onClick={handleButtonClick}
        className="cursor-pointer rounded-[10px] border border-[#01CEF8] bg-[#FFF6E5] transition-colors duration-200 hover:bg-[#01CEF8] hover:text-white focus:ring-2 focus:ring-[#01CEF8] focus:outline-none lg:h-[53px] lg:w-[201px]"
      >
        Upload your picture
      </button>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}

export default Picture;
