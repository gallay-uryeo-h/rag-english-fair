import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './', // 상대 경로 에셋 로딩
  build: {
    outDir: '../static',
    emptyOutDir: false, // 기존 static 폴더 파일 보존
  },
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:8000',
      '/pages_cache': 'http://127.0.0.1:8000',
    },
  },
})
