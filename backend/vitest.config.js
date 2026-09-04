import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        setupFiles: ["./tests/setup.js"],
        // test files share one dev database/redis; running them in
        // parallel lets one file's cleanups race another's requests
        fileParallelism: false,
        coverage: {
            reporter: ["text", "html"],
        },
    },
});
