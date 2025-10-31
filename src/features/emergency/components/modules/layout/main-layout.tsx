import { type FC, type ReactNode } from 'react';
import MenuBar from '@/features/emergency/components/animatedmenu.tsx';
import Header from '@/features/emergency/components/modules/navbar/header.tsx';
import { cn } from '@/lib/utils.ts';

type MainLayoutProps = {
  overlap?: boolean;
  children: ReactNode;
  classname?: string;
};

const MainLayout: FC<MainLayoutProps> = ({
  overlap = false,
  children,
  classname,
}) => {
  return (
    <main className={cn('min-h-screen bg-gray-50', classname)}>
      <Header />
      <div className="relative">
        <div
          className={cn(
            'my-6 flex flex-row items-center justify-center',
            overlap && 'absolute top-12 z-100 mx-auto w-full'
          )}
        >
          <MenuBar />
        </div>
        <div className="grid flex-1 items-start gap-4 p-0 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </div>
      </div>
    </main>
  );
};

export default MainLayout;
