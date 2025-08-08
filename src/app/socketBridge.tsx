"use client";

import { Toaster } from "react-hot-toast";
import { useSocket } from "@/hooks/useSocket";

export default function SocketBridge() {
  useSocket();          // starts and listens globally once
  return <Toaster position="bottom-center" />;
}
