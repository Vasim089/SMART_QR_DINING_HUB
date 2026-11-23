import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Custom Vite plugin to print direct links in terminal
const printLinksPlugin = () => ({
  name: 'print-links',
  configureServer(server) {
    const originalPrint = server.printUrls;
    server.printUrls = () => {
      originalPrint.call(server);
      console.log('\n  ============================================================');
      console.log('  🎯 SMART QR DINING HUB - ACCESS LINKS');
      console.log('  ============================================================');
      console.log('  👑 OWNER / ADMIN DASHBOARD: http://localhost:5173/?mode=owner');
      console.log('     Login Credentials:       admin@dininghub.com / admin123');
      console.log('     (Where Table QR Codes, Daily Menu & Analytics are managed)');
      console.log('  ------------------------------------------------------------');
      console.log('  🍽️ CUSTOMER TABLE 1:        http://localhost:5173/?restaurant=1&table=1');
      console.log('  🍽️ CUSTOMER TABLE 5:        http://localhost:5173/?restaurant=1&table=5');
      console.log('  📱 PHONE / WI-FI SCAN:      http://192.168.0.210:5173/?restaurant=1&table=1');
      console.log('  ============================================================\n');
    };
  }
})

export default defineConfig({
  clearScreen: false,
  plugins: [react(), printLinksPlugin()],
  server: {
    port: 5173,
    host: true,
  }
})
