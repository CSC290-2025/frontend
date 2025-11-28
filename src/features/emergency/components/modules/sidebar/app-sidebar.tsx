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
import { useNotification } from '@/features/emergency/hooks/notification.tsx';

export function AppSidebar() {
  const { msgLocal } = useNotification();
  return (
    <Sidebar variant="floating">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Notification</SidebarGroupLabel>
          <SidebarGroupContent>
            {msgLocal.map((msg, index) => (
              <Card key={index}>
                <CardContent>
                  <CardTitle>{msg.title}</CardTitle>
                  <CardDescription>{msg.body}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
