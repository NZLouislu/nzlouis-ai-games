"use client";

import { createContext, useContext, ReactNode } from "react";
import useDeviceType from "@/hooks/useDeviceType";

type DeviceType = "mobile" | "tablet" | "laptop" | "desktop" | "wide";

interface ResponsiveContextType {
  deviceType: DeviceType;
  windowSize: {
    width: number;
    height: number;
  };
}

const ResponsiveContext = createContext<ResponsiveContextType | undefined>(
  undefined
);

export function ResponsiveProvider({ children }: { children: ReactNode }) {
  const { deviceType, windowSize } = useDeviceType();

  // 只在客户端渲染时提供上下文值
  if (typeof window === "undefined") {
    return <>{children}</>;
  }

  return (
    <ResponsiveContext.Provider value={{ deviceType, windowSize }}>
      {children}
    </ResponsiveContext.Provider>
  );
}

export function useResponsive() {
  const context = useContext(ResponsiveContext);
  if (context === undefined) {
    // 在服务器端渲染时返回默认值
    if (typeof window === "undefined") {
      return {
        deviceType: "desktop" as DeviceType,
        windowSize: { width: 1200, height: 800 },
      };
    }
    throw new Error("useResponsive must be used within a ResponsiveProvider");
  }
  return context;
}
