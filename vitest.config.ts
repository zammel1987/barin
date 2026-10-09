import { defineConfig } from 'vitest/config'

// 单元测试只需要纯逻辑，不加载 PWA 插件
export default defineConfig({ test: { environment: 'node' } })
