'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export default function NotificationBell({ userId }) {
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        const fetchNotifications = async () => {
            const { data } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(20);

            if (data) setNotifications(data);
        };

        fetchNotifications();

        // Realtime subscription
        const channel = supabase
            .channel(`notifications-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    setNotifications(prev => [payload.new, ...prev]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (notifId) => {
        await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', notifId);

        setNotifications(prev =>
            prev.map(n => n.id === notifId ? { ...n, read: true } : n)
        );
    };

    const markAllAsRead = async () => {
        const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
        if (unreadIds.length === 0) return;

        await supabase
            .from('notifications')
            .update({ read: true })
            .in('id', unreadIds);

        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const getIcon = (type) => {
        switch (type) {
            case 'new_grade':
                return '📝';
            case 'new_message':
                return '💬';
            case 'new_submission':
                return '📄';
            default:
                return '🔔';
        }
    };

    const timeAgo = (dateStr) => {
        const now = new Date();
        const date = new Date(dateStr);
        const diffMs = now - date;
        const diffMin = Math.floor(diffMs / 60000);
        const diffHr = Math.floor(diffMs / 3600000);
        const diffDay = Math.floor(diffMs / 86400000);

        if (diffMin < 1) return 'Ahora';
        if (diffMin < 60) return `Hace ${diffMin}m`;
        if (diffHr < 24) return `Hace ${diffHr}h`;
        return `Hace ${diffDay}d`;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-2 text-blue-200 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                aria-label="Notificaciones"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse shadow-lg">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="text-sm font-bold text-gray-800">Notificaciones</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-[#0f4c81] hover:underline font-medium"
                            >
                                Marcar todas como leídas
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-gray-400 text-sm">
                                No tenés notificaciones
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n.id}
                                    onClick={() => markAsRead(n.id)}
                                    className={`px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors flex gap-3 ${!n.read ? 'bg-blue-50/50' : ''}`}
                                >
                                    <span className="text-lg shrink-0 mt-0.5">{getIcon(n.type)}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm ${!n.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                            {n.title}
                                        </p>
                                        {n.body && (
                                            <p className="text-xs text-gray-500 mt-0.5 truncate">{n.body}</p>
                                        )}
                                        <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
                                    </div>
                                    {!n.read && (
                                        <span className="w-2 h-2 bg-[#0f4c81] rounded-full shrink-0 mt-2"></span>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
