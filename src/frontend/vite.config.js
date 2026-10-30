import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Chạy dev: giao diện ở cổng 5173, chuyển /api sang API Express ở cổng 3000 (không cần cấu hình CORS)
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { '/api': 'http://localhost:3000' } },
});
