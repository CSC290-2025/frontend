import { useRef, useState } from 'react';

interface PicturePropsWithSetter {
  username: string;
  picture: string;
  userId: number;
  onFileSelect?: (file: File) => void;
}

function Picture({
  username,
  picture,
  userId,
  onFileSelect,
}: PicturePropsWithSetter) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(picture || null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (e.g., max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('File size must be less than 5MB');
        return;
      }

      const imageUrl = URL.createObjectURL(file);
      setPreviewUrl(imageUrl);

      // Notify parent component that a file was selected
      if (onFileSelect) {
        onFileSelect(file);
      }
    }
  };

  return (
    <div className="flex w-full flex-col items-center gap-4 md:w-[250px] lg:w-[295px] lg:gap-[22px]">
      {/* Image Container */}
      <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-[10px] border bg-gray-50 md:h-32 md:w-32 lg:h-[146px] lg:w-[146px]">
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
      <h1 className="w-full text-center text-xl font-semibold break-words text-[#2B5991] md:text-2xl lg:text-[32px]">
        {username}
      </h1>

      <button
        onClick={handleButtonClick}
        className="h-12 w-full max-w-[250px] cursor-pointer rounded-[10px] border border-[#01CEF8] bg-[#FFF6E5] px-4 text-sm font-medium transition-colors duration-200 hover:bg-[#01CEF8] hover:text-white md:h-[53px] md:w-full md:text-base"
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
