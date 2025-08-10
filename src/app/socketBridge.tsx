"use client";

import { Toaster } from "react-hot-toast";
import { useSocket } from "@/hooks/useSocket";
import { useRealtime } from "@/hooks/useRealTime";

export default function SocketBridge() {
  // useSocket();          // starts and listens globally once
  useRealtime();
  return <Toaster position="bottom-center" />;
}
