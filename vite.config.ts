import { defineConfig } from "vite";

export default defineConfig({
	root: ".",
	build: {
		lib: {
			entry: "src/main.ts",
			name: "ReturnNewReddit",
			fileName: () => "main.js",
			formats: ["iife"], // important!
		},
		rollupOptions: {
			output: {
				inlineDynamicImports: true, // avoid chunks
			},
			treeshake: false,
			optimization: {
				"pifeForModuleWrappers": true,
				"inlineConst": true,
			}
		},
		target: "es2020",
		sourcemap: true,
		minify: false, // keep debugging easy for now
	},
});
