// vite.config.js
import { defineConfig } from "file:///C:/DEV/react3js/AR-Deep/ar-game/node_modules/vite/dist/node/index.js";
import react from "file:///C:/DEV/react3js/AR-Deep/ar-game/node_modules/@vitejs/plugin-react/dist/index.mjs";
import mkcert from "file:///C:/DEV/react3js/AR-Deep/ar-game/node_modules/vite-plugin-mkcert/dist/mkcert.mjs";
var vite_config_default = defineConfig({
  plugins: [react(), mkcert()],
  server: {
    host: true,
    https: true,
    port: 5173
  },
  optimizeDeps: {
    include: [
      "three",
      "@react-three/fiber",
      "@react-three/drei",
      "@react-three/rapier"
      // <-- adicionado
    ],
    exclude: ["@react-three/xr"]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxERVZcXFxccmVhY3QzanNcXFxcQVItRGVlcFxcXFxhci1nYW1lXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxERVZcXFxccmVhY3QzanNcXFxcQVItRGVlcFxcXFxhci1nYW1lXFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9ERVYvcmVhY3QzanMvQVItRGVlcC9hci1nYW1lL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IG1rY2VydCBmcm9tICd2aXRlLXBsdWdpbi1ta2NlcnQnO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbcmVhY3QoKSwgbWtjZXJ0KCldLFxuICBzZXJ2ZXI6IHtcbiAgICBob3N0OiB0cnVlLFxuICAgIGh0dHBzOiB0cnVlLFxuICAgIHBvcnQ6IDUxNzMsXG4gIH0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGluY2x1ZGU6IFtcbiAgICAgICd0aHJlZScsXG4gICAgICAnQHJlYWN0LXRocmVlL2ZpYmVyJyxcbiAgICAgICdAcmVhY3QtdGhyZWUvZHJlaScsXG4gICAgICAnQHJlYWN0LXRocmVlL3JhcGllcicgICAvLyA8LS0gYWRpY2lvbmFkb1xuICAgIF0sXG4gICAgZXhjbHVkZTogWydAcmVhY3QtdGhyZWUveHInXSxcbiAgfSxcbn0pO1xuXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXlSLFNBQVMsb0JBQW9CO0FBQ3RULE9BQU8sV0FBVztBQUNsQixPQUFPLFlBQVk7QUFFbkIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUM7QUFBQSxFQUMzQixRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsSUFDUCxNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsY0FBYztBQUFBLElBQ1osU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVMsQ0FBQyxpQkFBaUI7QUFBQSxFQUM3QjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
