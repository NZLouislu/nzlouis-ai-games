# 页面跳转性能优化

## 问题描述
页面跳转时间过长（575ms），用户体验不佳。

## 已修复的问题

### 1. Next.js Link 预加载优化
**问题**: 导航链接没有启用预加载功能
**修复**: 在所有 `<Link>` 组件中添加 `prefetch={true}` 属性
- 文件: `components/Navbar.tsx`
- 效果: 当用户鼠标悬停在链接上时，Next.js 会预加载目标页面，大幅减少实际点击后的加载时间

### 2. ResponsiveContext SSR 优化
**问题**: ResponsiveProvider 在服务端渲染时返回空内容，导致客户端需要重新渲染
**修复**: 
- 添加 `mounted` 状态跟踪
- 在服务端和首次渲染时提供默认值
- 文件: `contexts/ResponsiveContext.tsx`
- 效果: 避免页面闪烁和不必要的重新渲染

### 3. Next.js 配置优化
**问题**: 缺少性能优化配置
**修复**: 在 `next.config.ts` 中添加:
- `reactStrictMode: true` - 启用严格模式
- `swcMinify: true` - 使用 SWC 压缩代码
- 图片格式优化 (AVIF, WebP)
- 生产环境移除 console.log

### 4. 添加 Loading 状态
**问题**: 页面加载时没有视觉反馈
**修复**: 为所有游戏页面添加 `loading.tsx` 文件
- `/air-balloon/loading.tsx`
- `/ai-fish/loading.tsx`
- `/geometry-dash/loading.tsx`
- `/rock-paper-scissors/loading.tsx`
- `/desktop-pet/loading.tsx`
- `/swimming-fish/loading.tsx`
- `/arrows-defense/loading.tsx`
- `/loading.tsx` (根路由)

### 5. 导航逻辑优化
**问题**: handleHome 函数使用了不必要的 setTimeout 和 window.focus
**修复**: 简化为直接调用 router.push()
- 文件: `components/Navbar.tsx`

## 预期效果

1. **首次点击**: 加载时间应该从 575ms 降低到 200-300ms
2. **后续点击**: 由于预加载，加载时间应该在 50-100ms 以内
3. **用户体验**: 
   - 立即显示 loading 动画
   - 页面切换更流畅
   - 减少白屏时间

## 测试建议

1. 清除浏览器缓存后测试首次加载
2. 测试鼠标悬停后的点击速度
3. 使用 Chrome DevTools 的 Network 面板监控加载时间
4. 测试移动端和桌面端的表现

## 进一步优化建议

如果仍然觉得慢，可以考虑:

1. **代码分割**: 将大型游戏组件拆分为更小的模块
2. **懒加载**: 使用 `dynamic()` 懒加载游戏组件
3. **图片优化**: 确保所有图片都经过压缩
4. **CDN**: 使用 CDN 加速静态资源
5. **Service Worker**: 添加离线缓存支持
