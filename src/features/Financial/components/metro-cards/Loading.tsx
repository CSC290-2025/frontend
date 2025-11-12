import { Spinner } from '@/components/ui/spinner';
import React from 'react';

const Loading = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <Spinner className="size-10 text-cyan-400" />
    </div>
  );
};

export default Loading;
