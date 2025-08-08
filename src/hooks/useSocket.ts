'use client'
import { useNotificationStore } from "@/store/useNotificationStore";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = "http://ec2-3-28-58-24.me-central-1.compute.amazonaws.com";

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const addNotification = useNotificationStore((s) => s.addNotification);

  useEffect(() => {
    const s = io(SOCKET_URL, {
      transports: ["websocket", "polling"], // default, but explicit for clarity
      withCredentials: false
    });
    socketRef.current = s;

    s.on("connect", () => console.log("✅ socket connected", s.id));
    s.on("connect_error", (err) => console.error("❌ connect_error:", err.message));
    s.on("error", (err) => console.error("❌ socket error:", err));
    s.on("disconnect", (reason) => console.log("ℹ️ socket disconnected:", reason));
    s.on("reconnect_attempt", (n) => console.log("↩️ reconnect attempt", n));

    s.on("new_notification", (data) => {
      console.log("🔔 New notification received", data);
      addNotification(data);
       // 🔔 show a sticky toast until dismissed

      toast.success(data?.title || "New notification", { duration: Infinity });

      // toast.custom(<YourCustomToastComponent data={data} />, { duration: Infinity });
    });

    return () => {
      s.close();
      console.log("❌ Disconnected from socket");
    };
  }, [addNotification]);

  return socketRef.current;
};
