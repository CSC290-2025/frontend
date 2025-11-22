import { toast } from 'sonner';

export const FailedError = (message: string) => {
  toast.error(message, {
    position: 'top-right',
    style: {
      background: '#ED1C24',
      color: 'white',
      border: '1px solid #ED1C24',
    },
  });
};

export const SuccessToast = (message: string) => {
  toast.success(message, {
    position: 'top-right',
    style: {
      background: '#4BB543',
      color: 'white',
      border: '1px solid #4BB543',
    },
  });
};
