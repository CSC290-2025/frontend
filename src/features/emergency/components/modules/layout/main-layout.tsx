import { type FC, type ReactNode, useEffect, useState } from 'react';
import MenuBar from '@/features/emergency/components/animatedmenu.tsx';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import Header from '@/features/emergency/components/modules/navbar/header.tsx';
import { useNotification } from '@/features/emergency/contexts/notification.tsx';
import { cn } from '@/lib/utils.ts';
import { AppSidebar } from '@/features/emergency/components/modules/sidebar/app-sidebar.tsx';
import { apiClient } from '@/lib/apiClient.ts';

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
  const { sendAllNotification } = useNotification();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const me = await apiClient.get('/auth/me');
      setRole(me.data.data.role);
    };
    fetchUserId();
  }, []);

  // useEffect(() => {
  //   sendAllNotification('Test4', 'Hi Reactes!!!');
  // }, []);
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <main className={cn('mx-auto min-h-screen w-full bg-gray-50', classname)}>
        <Header />
        <div className="relative">
          <div
            className={cn(
              'my-6 flex flex-row items-center justify-center',
              overlap && 'absolute z-50 w-full'
            )}
          >
            {role === 'Citizen' && <MenuBar />}
          </div>
          <div className="grid w-full flex-1 items-start gap-4 p-0">
            {children}
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
};

export default MainLayout;
