'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { useNotifications } from '@/hooks/useNotifications';
import { formatRelativeTime } from '@/lib/formatters';
import { getNotificationRoute } from '@/constants/notifications.constants';
import type { NotificationItem } from '@/types/notifications.types';

interface NotificationsDropdownProps {
    branchId?: number | null;   // ← was `number` — AuthUser.branchId can be null
}

export function NotificationsDropdown({ branchId }: NotificationsDropdownProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const { list, count, markRead, markAllRead } = useNotifications(branchId ?? undefined);
    const unreadCount = count.data?.count ?? 0;
    const items = list.data ?? [];

    const handleNotificationClick = (item: NotificationItem) => {
        if (!item.is_read) {
            markRead.mutate(item.id);
        }
        setOpen(false);
        router.push(getNotificationRoute(item.type));
    };

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className="relative p-2.5 text-gray-400 hover:text-gray-600
                               hover:bg-gray-100 rounded-xl transition-colors
                               border border-gray-200"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1
                                          flex items-center justify-center rounded-full
                                          bg-red-500 text-white text-[10px] font-bold"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          className="w-80 p-0 rounded-2xl overflow-hidden bg-white text-gray-900 shadow-2xl border border-gray-100 z-[200]">
          {" "}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-[13px] font-bold text-gray-800">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
                className="flex items-center gap-1 text-[11px] font-medium
                                       text-blue-600 hover:text-blue-700 disabled:opacity-50"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {list.isLoading ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-12 rounded-lg" />
                <Skeleton className="h-12 rounded-lg" />
              </div>
            ) : items.length === 0 ? (
              <p className="text-[12px] text-gray-400 text-center py-8">
                No new notifications
              </p>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className="w-full text-left px-4 py-3 border-b border-gray-50
                                           hover:bg-gray-50 transition-colors last:border-0"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[12.5px] font-medium text-gray-800">
                      {item.title}
                    </p>
                    {!item.is_read && (
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-[11.5px] text-gray-500 mt-0.5">
                    {item.message}
                  </p>
                  <p className="text-[10.5px] text-gray-400 mt-1">
                    {formatRelativeTime(item.created_at)}
                  </p>
                </button>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
}
