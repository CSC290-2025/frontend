import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { Routes } from '@generouted/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/features/emergency/components/ui/sonner.tsx';
import { NotificationProvider } from '@/features/emergency/hooks/notification.tsx';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <Routes />
        <Toaster />
      </NotificationProvider>
    </QueryClientProvider>
  </StrictMode>
);
