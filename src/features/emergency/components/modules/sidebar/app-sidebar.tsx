import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
} from '@/components/ui/sidebar';
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useNotification } from '@/features/emergency/contexts/notification.tsx';

export function AppSidebar() {
  const { msgLocal } = useNotification();
  return (
    <Sidebar variant="floating">
      <SidebarContent className="mt-2">
        <SidebarGroup>
          <SidebarGroupLabel>Notification</SidebarGroupLabel>
          <SidebarGroupContent className="space-y-3">
            {msgLocal.map((msg, index) => (
              <Card
                key={index}
                className="rounded-md border border-gray-200 bg-white shadow-sm"
              >
                <CardContent className="p-3">
                  <CardTitle className="text-sm font-semibold text-gray-900">
                    {msg.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-500">
                    {msg.body}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
