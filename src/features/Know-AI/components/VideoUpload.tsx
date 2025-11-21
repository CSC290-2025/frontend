import { useRef, useState } from 'react';
import { useUploadFile } from '../hooks/useCourse';

interface VideoUploadProps {
  onUploadComplete: (url: string) => void;
  currentUrl?: string | null;
}

export default function VideoUpload({
  onUploadComplete,
  currentUrl,
}: VideoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>('');
  const { mutate: upload, isPending } = useUploadFile();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    upload(file, {
      onSuccess: (url) => {
        onUploadComplete(url);
      },
    });
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <label className="font-medium text-gray-700">Video File Upload</label>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isPending}
          className={`w-full rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors sm:w-auto ${isPending ? 'cursor-wait bg-gray-400' : 'bg-[#01CEF8] hover:bg-[#00b5da]'}`}
        >
          {isPending ? 'Uploading...' : 'Choose Video'}
        </button>

        <span className="max-w-xs truncate text-sm text-gray-500">
          {isPending
            ? `Uploading: ${fileName}...`
            : currentUrl
              ? `Uploaded ✓`
              : 'No video selected'}
        </span>
      </div>

      <input
        type="file"
        accept="video/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
