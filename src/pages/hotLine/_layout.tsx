import { Outlet } from 'react-router';
import MainLayout from '@/features/emergency/components/modules/layout/main-layout.tsx';
import { ContactFormProvider } from '@/features/emergency/hooks/contact-from.tsx';

export default function HotLineLayout() {
  return (
    <MainLayout>
      <ContactFormProvider>
        <Outlet />
      </ContactFormProvider>
    </MainLayout>
  );
}
