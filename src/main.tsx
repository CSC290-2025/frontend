import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/features/auth';
import App from './App';
import { Toaster } from '@/features/emergency/components/ui/sonner.tsx';
import { NotificationProvider } from '@/features/emergency/hooks/notification.tsx';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <App />
          <Toaster />
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);
