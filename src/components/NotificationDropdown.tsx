import { useRef, useEffect } from "react";
import { Link } from "react-router";
import type { notiResponse } from "../interface/notiInterface";
import {
    Bell,
    ShoppingCart,
    Package,
    AlertCircle,
    Info,
    CheckCircle,
    Clock,
} from "lucide-react";

interface NotificationDropdownProps {
    notifications: notiResponse[];
    isOpen: boolean;
    onClose: () => void;
}

// Map notification type to icon & color
const getNotiMeta = (type: string) => {
    switch (type) {
        case "order":
            return {
                icon: <ShoppingCart className="h-5 w-5" />,
                color: "text-blue-500",
                bg: "bg-blue-50",
            };
        case "shipping":
            return {
                icon: <Package className="h-5 w-5" />,
                color: "text-indigo-500",
                bg: "bg-indigo-50",
            };
        case "success":
            return {
                icon: <CheckCircle className="h-5 w-5" />,
                color: "text-green-500",
                bg: "bg-green-50",
            };
        case "warning":
            return {
                icon: <AlertCircle className="h-5 w-5" />,
                color: "text-amber-500",
                bg: "bg-amber-50",
            };
        default:
            return {
                icon: <Info className="h-5 w-5" />,
                color: "text-gray-500",
                bg: "bg-gray-50",
            };
    }
};

// Format relative time
const timeAgo = (dateStr: string): string => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
};

function NotificationDropdown({
    notifications,
    isOpen,
    onClose,
}: NotificationDropdownProps) {
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const unread = notifications.filter((n) => !n.isRead);
    const read = notifications.filter((n) => n.isRead);

    return (
        <div
            ref={dropdownRef}
            className="absolute left-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
            style={{ maxHeight: "480px" }}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-linear-to-r from-blue-50 to-white">
                <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-blue-600" />
                    <h3 className="text-base font-bold text-gray-900">Notifications</h3>
                    {unread.length > 0 && (
                        <span className="ml-1 inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-red-500 text-[10px] font-bold text-white">
                            {unread.length}
                        </span>
                    )}
                </div>
            </div>

            {/* Notification List */}
            <div className="overflow-y-auto" style={{ maxHeight: "390px" }}>
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4">
                        <div className="p-4 rounded-full bg-gray-50 mb-3">
                            <Bell className="h-8 w-8 text-gray-300" />
                        </div>
                        <p className="text-sm font-medium text-gray-400">
                            No notifications yet
                        </p>
                        <p className="text-xs text-gray-300 mt-1">
                            You're all caught up!
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Unread section */}
                        {unread.length > 0 && (
                            <div>
                                <div className="px-4 py-2 bg-blue-50/50">
                                    <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
                                        New
                                    </p>
                                </div>
                                {unread.map((noti) => {
                                    const meta = getNotiMeta(noti.type);
                                    return (
                                        <Link
                                            key={noti.id}
                                            to={noti.link || "#"}
                                            onClick={onClose}
                                            className="flex items-start gap-3 px-4 py-3 hover:bg-blue-50/40 transition-colors border-l-[3px] border-blue-500 bg-blue-50/20"
                                        >
                                            <div
                                                className={`shrink-0 mt-0.5 p-2 rounded-xl ${meta.bg} ${meta.color}`}
                                            >
                                                {meta.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">
                                                    {noti.title}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                                                    {noti.body}
                                                </p>
                                                <div className="flex items-center gap-1 mt-1.5">
                                                    <Clock className="h-3 w-3 text-gray-400" />
                                                    <span className="text-[10px] text-gray-400 font-medium">
                                                        {timeAgo(noti.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                            {/* Unread dot */}
                                            <span className="shrink-0 mt-2 h-2.5 w-2.5 rounded-full bg-blue-500" />
                                        </Link>
                                    );
                                })}
                            </div>
                        )}

                        {/* Read section */}
                        {read.length > 0 && (
                            <div>
                                {unread.length > 0 && (
                                    <div className="px-4 py-2 bg-gray-50/50">
                                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                                            Earlier
                                        </p>
                                    </div>
                                )}
                                {read.map((noti) => {
                                    const meta = getNotiMeta(noti.type);
                                    return (
                                        <Link
                                            key={noti.id}
                                            to={noti.link || "#"}
                                            onClick={onClose}
                                            className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-l-[3px] border-transparent"
                                        >
                                            <div
                                                className={`shrink-0 mt-0.5 p-2 rounded-xl bg-gray-50 text-gray-400`}
                                            >
                                                {meta.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-700 truncate">
                                                    {noti.title}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
                                                    {noti.body}
                                                </p>
                                                <div className="flex items-center gap-1 mt-1.5">
                                                    <Clock className="h-3 w-3 text-gray-300" />
                                                    <span className="text-[10px] text-gray-300 font-medium">
                                                        {timeAgo(noti.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default NotificationDropdown;
