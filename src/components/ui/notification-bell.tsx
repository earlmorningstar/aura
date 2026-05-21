"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check } from "lucide-react";
import { useNotifications, type Notification } from "@/hooks/use-notifications";
import { format } from "date-fns";

export function NotificationBell() {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        if (open) document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    return (
        <div ref={ref} className="relative">
            <motion.button
                className="relative flex h-9 w-9 items-center justify-center rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-aura-cyan/60"
                style={{
                    background: open ? "rgba(var(--glass-bg-rgb) / 0.1)" : "rgba(var(--glass-bg-rgb) / 0.06)",
                    border: open
                        ? "1px solid rgba(var(--glass-border-rgb) / 0.16)"
                        : "1px solid rgba(var(--glass-border-rgb) / var(--glass-border-opacity))",
                    color: open ? "var(--text-primary)" : "var(--text-secondary)",
                }}
                whileHover={{
                    color: "var(--text-primary)",
                    background: "rgba(var(--glass-bg-rgb) / 0.10)",
                    transition: { duration: 0.15 },
                }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setOpen(!open)}
                aria-label={`${unreadCount} unread notifications`}
            >
                <Bell size={16} />
                {unreadCount > 0 && (
                    <motion.span
                        className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold"
                        style={{ background: "var(--gradient-brand)", color: "var(--color-bg-void)" }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                    >
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </motion.span>
                )}
            </motion.button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto rounded-2xl p-2"
                        style={{
                            background: "rgba(10,10,18,0.96)",
                            backdropFilter: "blur(24px) saturate(180%)",
                            border: "1px solid rgba(var(--glass-border-rgb) / var(--glass-border-opacity-strong))",
                            boxShadow: "var(--shadow-lg)",
                            zIndex: 200,
                        }}
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    >
                        <div className="flex items-center justify-between px-3 py-2 mb-1">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/60">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={() => markAllAsRead()}
                                    className="text-xs text-cyan-400 hover:text-cyan-300"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {notifications.length === 0 ? (
                            <div className="py-8 text-center text-sm text-white/30">No notifications yet</div>
                        ) : (
                            notifications.slice(0, 20).map((n) => (
                                <div
                                    key={n.id}
                                    className={`flex items-start gap-3 rounded-xl px-3 py-2.5 cursor-pointer transition-colors ${!n.read ? "bg-white/5" : ""
                                        } hover:bg-white/10`}
                                    onClick={() => markAsRead(n.id)}
                                >
                                    <div
                                        className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${!n.read ? "bg-cyan-400" : "bg-white/20"
                                            }`}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white/90 leading-snug">{n.title}</p>
                                        {n.body && (
                                            <p className="text-xs text-white/50 mt-0.5 line-clamp-2">{n.body}</p>
                                        )}
                                        <p className="text-[10px] text-white/30 mt-1">
                                            {format(new Date(n.created_at), "MMM d, h:mm a")}
                                        </p>
                                    </div>
                                    {!n.read && (
                                        <Check size={14} className="text-cyan-400 shrink-0 mt-1" />
                                    )}
                                </div>
                            ))
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}