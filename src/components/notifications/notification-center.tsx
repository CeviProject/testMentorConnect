import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Notification } from "@/types";
import { format, parseISO } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, MessageSquare, FileText } from "lucide-react";

export function NotificationCenter() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);

      // Mock notifications data
      const today = new Date();
      const mockNotifications: Notification[] = [];

      // Generate notifications
      const types = [
        "request",
        "confirmation",
        "reminder",
        "summary",
        "follow-up",
      ];
      const titles = {
        request: "New Session Request",
        confirmation: "Session Confirmed",
        reminder: "Upcoming Session Reminder",
        summary: "Session Summary Available",
        "follow-up": "New Follow-up Message",
      };
      const messages = {
        request: "You have a new session request from a mentee.",
        confirmation: "Your session has been confirmed.",
        reminder: "You have an upcoming session in 1 hour.",
        summary: "Your session summary and transcript are now available.",
        "follow-up": "You received a follow-up message from your mentor.",
      };

      for (let i = 0; i < 10; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        const type = types[i % types.length] as
          | "request"
          | "confirmation"
          | "reminder"
          | "summary"
          | "follow-up";

        mockNotifications.push({
          id: `notification-${i}`,
          userId: user?.id || "user-1",
          title: titles[type],
          message: messages[type],
          type,
          read: i > 3, // First 4 are unread
          createdAt: date.toISOString(),
          relatedSessionId: `session-${(i % 3) + 1}`,
        });
      }

      setNotifications(mockNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)),
    );

    // Navigate to related content
    if (notification.relatedSessionId) {
      navigate(`/sessions/${notification.relatedSessionId}`);
    }
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "request":
      case "confirmation":
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case "reminder":
        return <Bell className="h-5 w-5 text-yellow-500" />;
      case "summary":
        return <FileText className="h-5 w-5 text-green-500" />;
      case "follow-up":
        return <MessageSquare className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {unreadCount} unread
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground">
          Stay updated with your mentoring activities
        </p>
      </div>

      <div className="flex justify-between items-center">
        <Tabs defaultValue="all" className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
            </TabsList>

            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            )}
          </div>

          <TabsContent value="all">
            {renderNotificationList(notifications)}
          </TabsContent>

          <TabsContent value="unread">
            {renderNotificationList(notifications.filter((n) => !n.read))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

  function renderNotificationList(notificationList: Notification[]) {
    if (isLoading) {
      return <div className="flex justify-center py-12">Loading...</div>;
    }

    if (notificationList.length === 0) {
      return (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No notifications</h3>
          <p className="text-muted-foreground mt-2">You're all caught up!</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {notificationList.map((notification) => (
          <Card
            key={notification.id}
            className={`cursor-pointer transition-colors hover:bg-muted/50 ${!notification.read ? "border-l-4 border-l-primary" : ""}`}
            onClick={() => handleNotificationClick(notification)}
          >
            <CardContent className="p-4 flex items-start space-x-4">
              <div className="mt-1">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4
                    className={`text-base ${!notification.read ? "font-medium" : ""}`}
                  >
                    {notification.title}
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    {format(parseISO(notification.createdAt), "MMM d, h:mm a")}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {notification.message}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
}
