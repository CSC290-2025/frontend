import { useRef, useState } from 'react';
import { useUploadFile } from '../hooks/useCourse';

interface CourseCoverProps {
  onUploadComplete: (url: string) => void;
  currentImageUrl?: string | null;
}

export default function CourseCoverUpload({
  onUploadComplete,
  currentImageUrl,
}: CourseCoverProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentImageUrl || null
  );

  const { mutate: upload, isPending } = useUploadFile();

  const handleButtonClick = () => {
    if (!isPending) fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setPreviewUrl(localUrl);
      upload(file, {
        onSuccess: (serverUrl) => {
          onUploadComplete(serverUrl);
        },
      });
    }
  };

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-3">
      <div
        onClick={handleButtonClick}
        className={`relative flex aspect-square w-full max-w-[280px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl bg-gray-200 transition-all hover:bg-gray-300 lg:max-w-[350px] ${isPending ? 'cursor-wait opacity-70' : ''}`}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Cover Preview"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-2xl font-medium text-gray-500">add</span>
        )}

        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
          </div>
        )}
      </div>

      <span className="text-xl font-medium text-black">cover_image</span>

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
