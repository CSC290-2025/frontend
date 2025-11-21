import { useState } from 'react';

export function useWeatherModel() {
  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState<any>(null);

  return {
    open,
    payload,
    show: (data: any) => {
      setPayload(data);
      setOpen(true);
    },
    hide: () => {
      setOpen(false);
      setPayload(null);
    },
  };
}
