import { build } from "esbuild";

import { copy } from "esbuild-plugin-copy";

build({
    // entryPoints: ["index.ts"],
    outdir: "public/api-docs",
    sourcemap: "inline",
    platform: "node",
    bundle: true,
    plugins: [
        copy({
            assets: [{
                    from: [
                        "./node_modules/swagger-ui-dist/swagger-ui-bundle.js",
                    ],
                    to: "swagger-ui-bundle.js",
                },
                {
                    from: [
                        "./node_modules/swagger-ui-dist/swagger-ui-standalone-preset.js",
                    ],
                    to: "swagger-ui-standalone-preset.js",
                },
                {
                    from: ["./node_modules/swagger-ui-dist/swagger-ui.css"],
                    to: "swagger-ui.css",
                },
            ],
        }),
    ],
}).catch(() => process.exit(1));