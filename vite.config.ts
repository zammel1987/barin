import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: '爬宠饲养记录',
        short_name: '爬宠记录',
        description: '螳螂、蜘蛛、蛇的喂食与排便记录工具',
        lang: 'zh-CN',
        theme_color: '#2f6b4f',
        background_color: '#f4f6f2',
        display: 'standalone',
        start_url: '.',
        icons: [{ src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
      },
    }),
  ],
})
