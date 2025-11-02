import { DialogTitle } from '@/features/emergency/components/ui/dialog';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Textarea } from '@/features/emergency/components/ui/textarea.tsx';
import { AlertTriangle, Camera, Car, Waves } from 'lucide-react';
import { Checkbox } from '@/features/emergency/components/ui/checkbox.tsx';
import { Label } from '@/features/emergency/components/ui/label';
import {
  ReportOmit,
  type ReportRequestFrom,
} from '@/features/emergency/interfaces/report.ts';
import { zodResolver } from '@hookform/resolvers/zod';

export default function ReportForm() {
  const [file, setFile] = useState<File | null>(null);
  const categories = [
    { name: 'Traffic', icon: <Car size={32} /> },
    { name: 'Accident', icon: <AlertTriangle size={32} /> },
    { name: 'Disaster', icon: <Waves size={32} /> },
  ];

  const {
    control,
    register,
    formState: { errors },
  } = useForm<ReportRequestFrom>({
    resolver: zodResolver(ReportOmit),
    defaultValues: {
      title: 'test',
      report_category: 'traffic',
      ambulance_service: false,
      image_url: 'kuy',
      user_id: null,
    },
  });
  return (
    <div className="flex flex-col gap-6">
      {/* Description */}
      <div>
        <DialogTitle className="mt-4 mb-4">What&#39;s happening?</DialogTitle>
        <Textarea
          placeholder="Type something..."
          {...register('description')}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Category */}
      <div>
        <h2 className="mt-4 mb-4 text-lg font-semibold">Select the category</h2>
        <Controller
          name="report_category"
          control={control}
          render={({ field }) => (
            <div className="flex justify-center gap-4">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => field.onChange(cat.name)}
                  className={`flex h-24 w-24 flex-col items-center justify-center gap-2 rounded-xl border transition ${
                    field.value === cat.name
                      ? 'border-black bg-black text-white'
                      : 'border-transparent bg-gray-100 text-gray-500'
                  }`}
                >
                  {cat.icon}
                  <span className="text-sm font-medium">{cat.name}</span>
                </button>
              ))}
            </div>
          )}
        />
        {errors.report_category && (
          <p className="mt-1 text-sm text-red-600">
            {errors.report_category.message}
          </p>
        )}
      </div>

      {/* File Upload */}
      <Controller
        name="image_url"
        control={control}
        render={({ field }) => (
          <label
            htmlFor="file-upload"
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-gray-300 p-3 hover:bg-gray-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500 text-white">
              <Camera size={20} />
            </div>
            <span className="text-sm text-gray-600">
              {file ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt="Preview"
                  className="h-20 w-20 rounded-md object-cover"
                />
              ) : (
                'Upload a picture file'
              )}
            </span>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setFile(f);
                  field.onChange(URL.createObjectURL(f));
                }
              }}
            />
          </label>
        )}
      />
      {errors.image_url && (
        <p className="mt-1 text-sm text-red-600">{errors.image_url.message}</p>
      )}

      {/* Ambulance Checkbox */}
      <div className="col-start-1 flex items-center gap-3">
        <Controller
          name="ambulance_service"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="ambulance"
              checked={field.value as boolean | undefined}
              onCheckedChange={(checked) => field.onChange(!!checked)}
            />
          )}
        />
        <Label htmlFor="ambulance">Ambulance needed?</Label>
        {errors.ambulance_service && (
          <p className="mt-1 text-sm text-red-600">
            {errors.ambulance_service.message}
          </p>
        )}
      </div>
    </div>
  );
}
