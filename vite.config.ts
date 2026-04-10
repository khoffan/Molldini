import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import sitemap from 'vite-plugin-sitemap'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    plugins: [react(), tailwindcss(), sitemap({
      hostname: 'https://molldini-frontend.vercel.app',
      dynamicRoutes: [
        '/',
        '/products',
        '/login',
        '/about',
        // สำหรับหน้าสินค้า คุณอาจต้อง Hardcode หรือดึงจาก API มาใส่ตรงนี้
      ]
    }),],
    define: {
      // แทนที่ข้อความเหล่านี้ด้วยค่าจริงตรงๆ
      '__FB_API_KEY__': JSON.stringify(env.VITE_FB_API_KEY),
      '__FB_AUTH_DOMAIN__': JSON.stringify(env.VITE_FB_AUTH_DOMAIN),
      '__FB_PROJECT_ID__': JSON.stringify(env.VITE_FB_PROJECT_ID),
      '__FB_STORAGE_BUCKET__': JSON.stringify(env.VITE_FB_STORAGE_BUCKET),
      '__FB_MESSAGING_SENDER_ID__': JSON.stringify(env.VITE_FB_MESSAGING_SENDER_ID),
      '__FB_APP_ID__': JSON.stringify(env.VITE_FB_APP_ID),
      '__FB_MEASUREMENT_ID__': JSON.stringify(env.VITE_FB_MEASUREMENT_ID),
    },

    // server: {
    //   port: 5173,
    //   strictPort: true,
    //   allowedHosts: [
    //     '.ngrok-free.app', // อนุญาตทุก subdomain ของ ngrok
    //     '.ngrok-free.dev', // อนุญาตทุก subdomain ของ ngrok
    //     'localhost'
    //   ],
    //   host: true
    // },
  }

})
