import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, "index.html"),
                showcase: resolve(__dirname, "showcase.html"),
            },
        },
        target: "ES2022"
    },
});