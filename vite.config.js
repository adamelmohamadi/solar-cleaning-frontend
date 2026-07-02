import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import os from "os";

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  const priorityNames = ["Wi-Fi", "wlan0", "en0"];

  // Cherche d'abord les interfaces WiFi connues
  for (const name of priorityNames) {
    if (interfaces[name]) {
      for (const iface of interfaces[name]) {
        if (iface.family === "IPv4" && !iface.internal) {
          return iface.address;
        }
      }
    }
  }

  // Sinon cherche en excluant VMware/VirtualBox/Hyper-V
  for (const name of Object.keys(interfaces)) {
    if (/vmware|virtualbox|vethernet|hyper-v/i.test(name)) continue;
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }

  return "127.0.0.1";
}

const localIP = getLocalIP();
console.log(`\n🌐 IP locale détectée : ${localIP}\n`);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5173,
  },
  define: {
    __API_URL__: JSON.stringify(`http://${localIP}:8000/api/`),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});