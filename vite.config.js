import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import os from "os";

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  const priorityNames = ["Wi-Fi", "wlan0", "en0"];
  for (const name of priorityNames) {
    if (interfaces[name]) {
      for (const iface of interfaces[name]) {
        if (iface.family === "IPv4" && !iface.internal) return iface.address;
      }
    }
  }
  for (const name of Object.keys(interfaces)) {
    if (/vmware|virtualbox|vethernet|hyper-v/i.test(name)) continue;
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) return iface.address;
    }
  }
  return "127.0.0.1";
}

const apiUrl = process.env.VITE_API_URL || `http://${getLocalIP()}:8000/api/`;
console.log(`\n🌐 API URL : ${apiUrl}\n`);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5173,
  },
  define: {
    __API_URL__: JSON.stringify(apiUrl),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});