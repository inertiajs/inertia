import { defineConfig } from 'tsup';

const commonConfig = {
	clean: true,
	splitting: true,
	dts: true,
	sourcemap: true,
	format: ['esm', 'cjs'],
	outDir: 'dist',
};
export default defineConfig([
	{
		entry: ['src/index.ts'],
		...commonConfig,
		name: 'index',
	},
	{
		entry: ['src/server.ts'],
		...commonConfig,
		name: 'server',
	},
]);
