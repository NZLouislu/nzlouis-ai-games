"use client";

import { useState, useEffect } from "react";

type DeviceType = "mobile" | "tablet" | "laptop" | "desktop" | "wide";

export default function useDeviceType() {
  const [deviceType, setDeviceType] = useState<DeviceType>("desktop");
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    // 在客户端执行，避免服务器端渲染问题
    if (typeof window === "undefined") return;

    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      // 根据屏幕宽度判断设备类型
      if (window.innerWidth < 640) {
        setDeviceType("mobile");
      } else if (window.innerWidth < 768) {
        setDeviceType("tablet");
      } else if (window.innerWidth < 1024) {
        setDeviceType("laptop");
      } else if (window.innerWidth < 1536) {
        setDeviceType("desktop");
      } else {
        setDeviceType("wide");
      }
    }

    // 初始化
    handleResize();

    // 添加事件监听器
    window.addEventListener("resize", handleResize);

    // 清理函数
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { deviceType, windowSize };
}
