import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
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
})
