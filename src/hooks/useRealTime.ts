// hooks/useRealtime.ts
"use client";
import { useEffect, useRef } from "react";
import { useNotificationStore } from "@/store/useNotificationStore";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const SOCKET_URL = "http://ec2-3-28-58-24.me-central-1.compute.amazonaws.com";


const isHttpsProd = () =>
  typeof window !== "undefined" &&
  window.location.protocol === "https:" &&
  !window.location.hostname.includes("localhost");

export function useRealtime() {
  const add = useNotificationStore(s => s.addNotification);
  const lastSeenRef = useRef<string | null>(null); // store latest createdAt

  useEffect(() => {
    // In prod HTTPS without a secure socket URL → fallback to polling
    if (isHttpsProd()) {
      const tick = async () => {
        try {
          const res = await fetch("/api/notification", { cache: "no-store" });
          const json = await res.json();
          const list = json?.data?.data ?? json?.data ?? []; // depending on your shape
          // find items newer than lastSeen and toast them
          const unread = list.filter((n: any) => n.read === false);
          const sorted = unread.sort((a: any, b: any) => (a.createdAt < b.createdAt ? 1 : -1));
          for (const n of sorted) {
            debugger;
            if (!lastSeenRef.current || new Date(n.createdAt) > new Date(lastSeenRef.current)) {
              add(n);
              toast.success(n.title ?? "New notification", { duration: 5000 });
            } else {
              break; // list is sorted, older after this
            }
          }
          if (sorted[0]?.createdAt) lastSeenRef.current = sorted[0].createdAt;
        } catch (e) {
          // silent retry
        }
      };
      tick();
      const id = setInterval(tick, 5000); // 5s polling
      return () => clearInterval(id);
    }

    // Otherwise, use real socket (local or when you set HTTPS socket URL)
    const url = SOCKET_URL || "http://localhost:3001";
    const s = io(url, { transports: ["websocket", "polling"] });

    s.on("new_notification", (data) => {
      add(data);
      toast.success(data?.title || "New notification", { duration: Infinity });
      if (data?.createdAt) lastSeenRef.current = data.createdAt;
    });

    return () => s.close();
  }, [add]);
}
