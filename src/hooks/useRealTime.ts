// hooks/useRealtime.ts
"use client";
import { useEffect, useRef } from "react";
import { useNotificationStore } from "@/store/useNotificationStore";
import toast from "react-hot-toast";
import { io, Socket } from "socket.io-client";

const PROD_URL = process.env.NEXT_PUBLIC_SOCKET_URL; // e.g. https://backend.urbanservices-qa.com
const LOCAL_URL = "https://backend.urbanservices-qa.com";

function pickSocketUrl() {
  if (typeof window === "undefined") return "";
  const isLocalhost = window.location.hostname === "localhost";
  return isLocalhost ? LOCAL_URL : (PROD_URL || "");
}

export function useRealtime() {
  const add = useNotificationStore(s => s.addNotification);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const url = pickSocketUrl();
    if (!url) {
      console.error("Socket URL missing. Set NEXT_PUBLIC_SOCKET_URL for prod.");
      return;
    }

    const s = io(url, {
      transports: ["websocket", "polling"], // keep polling as a fallback transport inside WS flow
      withCredentials: false,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
    socketRef.current = s;

    s.on("connect", () => console.log("✅ socket connected", s.id));
    s.on("connect_error", (err) => console.error("❌ connect_error:", err.message));
    s.on("error", (err) => console.error("❌ socket error:", err));
    s.on("disconnect", (reason) => console.log("ℹ️ socket disconnected:", reason));

    s.on("new_notification", (data) => {
      add(data);
      toast.success(data?.title || "New notification", { duration: 5000 });
    });

    return () => {
      s.close();
      socketRef.current = null;
    };
  }, [add]);
}
