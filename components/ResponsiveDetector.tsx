"use client";

import { useEffect } from "react";

export default function ResponsiveDetector() {
  // 这个组件现在不需要任何状态，因为我们使用了上下文

  useEffect(() => {
    // 组件挂载时不需要做任何事情
    // 设备检测现在由useDeviceType hook处理
  }, []);

  return null;
}
